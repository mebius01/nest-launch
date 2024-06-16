import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  if (process.env.NODE_ENV == 'production') app.set('trust proxy', 1);

  const config = app.get(ConfigService);
  const PORT = config.get('port') || 3001;
  const PREFIX = config.get('prefix');

  app.setGlobalPrefix(PREFIX);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // // security
  // app.enableCors({
  //   origin: process.env.FRONTEND_DOMAIN,
  //   credentials: true,
  // });
  // app.use(helmet());

  await app.listen(PORT, () =>
    console.info('Server started', {
      PORT: Number(PORT),
      MODE_ENV: process.env.NODE_ENV,
    }),
  );
}
bootstrap();
