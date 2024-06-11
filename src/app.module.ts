import { Module } from '@nestjs/common';
import { UsersModule } from './components/users/users.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration/main.config';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
    }),
    LoggerModule.forRoot({ ...configuration().pino }),
    UsersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
