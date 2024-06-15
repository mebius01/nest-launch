import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { DBMigration } from '../../src/services/database/migration';

(async function bootstrap() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const DBMigration = app.get(DBMigration);
    const migrationName = process.argv[2];
    await DBMigration.up(migrationName);
    await app.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
