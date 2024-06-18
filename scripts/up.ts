import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DBMigration } from '../src/services/database/migration';

(async function bootstrap() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const migration = app.get(DBMigration);
    const migrationName = process.argv[2];
    await migration.up(migrationName);
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
