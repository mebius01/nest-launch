import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DBInitializer } from '../src/services/database/initializer';

(async function bootstrap() {
  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const init = app.get(DBInitializer);
    await init.seed();
    await app.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
