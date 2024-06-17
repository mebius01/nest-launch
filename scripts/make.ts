import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DBMigration } from '../src/services/database/migration';

(async function bootstrap() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const migration = app.get(DBMigration);
    const migrationName = process.argv[2];
    if (!migrationName) {
      console.error('Please provide a migration name');
      process.exit(1);
    }

    migration.make(migrationName);
    await app.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
