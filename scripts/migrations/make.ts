import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { MigrationService } from '../../src/services/migration/migration.service';

(async function bootstrap() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const migrationService = app.get(MigrationService);
    const migrationName = process.argv[2];
    if (!migrationName) {
      console.error('Please provide a migration name');
      process.exit(1);
    }

    migrationService.make(migrationName);
    await app.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
