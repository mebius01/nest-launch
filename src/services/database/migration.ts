/* eslint-disable max-len */
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

  template(name: string): string {
    return `import { Client } from 'pg';

const TABLE_NAME = '${name}';

export const up = async (client: Client) => {
  await client.query(\`
    CREATE TABLE \${TABLE_NAME} (
      id SERIAL PRIMARY KEY, -- Primary key
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp with default value
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Another timestamp with default value

      -- Various PostgreSQL data types
      varchar_column VARCHAR(255), -- Variable length string
      text_column TEXT, -- Long text
      integer_column INTEGER, -- Integer
      boolean_column BOOLEAN, -- Boolean
      date_column DATE, -- Date
      time_column TIME, -- Time
      timestamp_column TIMESTAMP, -- Timestamp
      json_column JSON, -- JSON data
      jsonb_column JSONB, -- Binary JSON data
      float_column FLOAT, -- Floating point number
      double_column DOUBLE PRECISION, -- Double precision floating point number
      numeric_column NUMERIC, -- Arbitrary precision number
      uuid_column UUID, -- Universally unique identifier
      bytea_column BYTEA, -- Binary data ("byte array")
      smallint_column SMALLINT, -- Small integer
      bigint_column BIGINT, -- Large integer
      real_column REAL, -- Single precision floating point number
      char_column CHAR(1), -- Fixed length string
      inet_column INET, -- IP address
      cidr_column CIDR, -- Network IP address
      macaddr_column MACADDR, -- MAC address
      bit_column BIT(1), -- Fixed length bit string
      varbit_column VARBIT(10), -- Variable length bit string

      
      user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE, -- Foreign key with cascading delete
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL, -- Foreign key with setting null on delete
      order_id INTEGER REFERENCES orders(id) ON UPDATE CASCADE, -- Foreign key with cascading update

      -- Unique constraint on multiple columns
      CONSTRAINT unique_varchar_integer UNIQUE (varchar_column, integer_column)

      -- Check constraint
      CONSTRAINT check_integer_positive CHECK (integer_column > 0), -- Check constraint

      -- Default value
      default_column INTEGER DEFAULT 42, -- Column with default value

      -- Additional example constraints
      CONSTRAINT check_char_column CHECK (char_column IN ('A', 'B', 'C')), -- Check constraint with specific values
      CONSTRAINT unique_uuid UNIQUE (uuid_column), -- Unique constraint on single column

      -- Composite primary key example
      PRIMARY KEY (varchar_column, integer_column) -- Composite primary key
    );

    -- Indexes
    CREATE INDEX idx_created_at ON \${TABLE_NAME} (created_at);
    CREATE UNIQUE INDEX idx_unique_varchar ON \${TABLE_NAME} (varchar_column);
  \`);
};

export const down = async (client: Client) => {
  await client.query(\`DROP TABLE \${TABLE_NAME}\`);
};
`;
  }
  make(name: string): void {
    const timestamp = dayjs().format('YYYYMMDDHHmmss');
    const filename = `${timestamp}_${name}.ts`;
    const filepath = join(this.migrationsDir, filename);
    writeFileSync(filepath, this.template(name));
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
