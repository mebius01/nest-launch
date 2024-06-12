import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { MigrationService } from '../../src/services/migration/migration.service';

(async function bootstrap() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const migrationService = app.get(MigrationService);
    await migrationService.list();
    await app.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
