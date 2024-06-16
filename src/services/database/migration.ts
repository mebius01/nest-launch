import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DBConnection } from './connection';
import { readdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as dayjs from 'dayjs';
import * as chalk from 'chalk';

@Injectable()
export class DBMigration {
  constructor(
    private readonly connection: DBConnection,
    private readonly migrationsDir: string,
  ) {}

  /**
   * Creates a table named 'migrations' in the database if it doesn't already exist.
   * @return {Promise<void>} A Promise that resolves when the table is created.
   */
  private async createMigrationsTable(): Promise<void> {
    const client = this.connection.getClient;
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        run_on TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }

  /**
   * Retrieves the executed migrations from the database.
   * @return {Promise<string[]>} an array of strings representing executed migration names
   */
  private async getExecutedMigrations(): Promise<string[]> {
    const client = this.connection.getClient;
    const res = await client.query('SELECT name FROM migrations');
    return res.rows.map((row) => row.name);
  }

  /**
   * Logs a migration by inserting the corresponding entry into the migrations table.
   * @param {string} name - The name of the migration to log.
   * @return {Promise<void>} - A promise that resolves when the migration is successfully logged.
   */
  private async logMigration(name: string): Promise<void> {
    const client = this.connection.getClient;
    await client.query('INSERT INTO migrations (name) VALUES ($1)', [name]);
  }

  /**
   * Unlogs a migration by deleting the corresponding entry in the migrations table.
   * @param {string} name - The name of the migration to unlog.
   * @return {Promise<void>} - A promise that resolves when the migration is successfully unlogged.
   */
  private async unlogMigration(name: string): Promise<void> {
    const client = this.connection.getClient;
    await client.query('DELETE FROM migrations WHERE name = $1', [name]);
  }

  template(): string {
    return `import { Client } from 'pg';

export const up = async (client: Client) => {
  // Add your migration code here
};

export const down = async (client: Client) => {
  // Add your rollback code here
};
`;
  }

  make(name: string): void {
    const timestamp = dayjs().format('YYYYMMDDHHmmss');
    const filename = `${timestamp}_${name}.ts`;
    const filepath = join(this.migrationsDir, filename);
    writeFileSync(filepath, this.template());
    console.log(`Migration file created: ${filepath}`);
  }

  async list(): Promise<void> {
    await this.createMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();
    const migrationFiles = readdirSync(this.migrationsDir).filter((file) =>
      file.endsWith('.ts'),
    );

    for (const file of migrationFiles) {
      if (executedMigrations.includes(file)) {
        console.log(chalk.green(file));
      } else {
        console.log(chalk.red(file));
      }
    }

    await this.connection.disconnect();
  }

  async up(migrationName?: string): Promise<void> {
    // await this.connection.connect();
    const client = this.connection.getClient;
    await this.createMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();
    const migrationFiles = readdirSync(this.migrationsDir).filter(
      (file) =>
        file.endsWith('.ts') &&
        (!migrationName || file === migrationName) &&
        !executedMigrations.includes(file),
    );

    for (const file of migrationFiles) {
      const migration = await import(join(this.migrationsDir, file));
      await migration.up(client);
      await this.logMigration(file);
      console.log(`Migration ${file} executed`);
    }

    await this.connection.disconnect();
  }

  async down(migrationName?: string): Promise<void> {
    // await this.connection.connect();
    const client = this.connection.getClient;
    await this.createMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();
    const migrationFiles = readdirSync(this.migrationsDir).filter(
      (file) =>
        file.endsWith('.ts') &&
        (!migrationName || file === migrationName) &&
        executedMigrations.includes(file),
    );

    for (const file of migrationFiles) {
      const migration = await import(join(this.migrationsDir, file));
      await migration.down(client);
      await this.unlogMigration(file);
      console.log(`Migration ${file} rolled back`);
    }

    await this.connection.disconnect();
  }

  async rollback(): Promise<void> {
    // await this.connection.connect();
    const client = this.connection.getClient;
    await this.createMigrationsTable();

    const executedMigrations = await this.getExecutedMigrations();

    for (const file of executedMigrations) {
      const migration = await import(join(this.migrationsDir, file));
      await migration.down(client);
      await this.unlogMigration(file);
      console.log(`Migration ${file} rolled back`);
    }

    await this.connection.disconnect();
  }
}
