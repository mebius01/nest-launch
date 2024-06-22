import { DBMapper } from './services/database/mapper';
import { Module } from '@nestjs/common';
import { UsersModule } from './components/users/users.module';
import { ConfigModule, ConfigService} from '@nestjs/config';
import configuration from './configuration/main.config';
import { LoggerModule } from 'nestjs-pino';
import { DBConnection } from './services/database/connection';
import { DBMigration } from './services/database/migration';
import { join } from 'path';
import { DatabaseModule } from './services/database/database.module';
import { DBInitializer } from './services/database/initializer';
import { RedisModule } from './services/redis/redis.module';
import { Logger } from 'nestjs-pino';
import { AuthModule } from './components/auth/auth.module';
import { TokenGuard } from './services/token/token.guard';
import { APP_GUARD } from '@nestjs/core';
import { TokenModule } from './services/token/token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
    }),
    LoggerModule.forRoot({ ...configuration().pino }),
    UsersModule,
    DatabaseModule,
    RedisModule,
    TokenModule,
    AuthModule
  ],
  controllers: [],
  providers: [
    {
      provide: DBMigration,
      useFactory: (DBConnection: DBConnection) => {
        const migrationsDir = join(__dirname, 'database', 'migrations');
        return new DBMigration(DBConnection, migrationsDir);
      },
      inject: [DBConnection],
    },
    {
      provide: DBInitializer,
      useFactory: (dbMapper: DBMapper, logger: Logger) => {
        const seedsDir = join(__dirname, 'database', 'seeds');
        return new DBInitializer(logger, dbMapper, seedsDir);
      },
      inject: [DBMapper],
    },
  ]
})
export class AppModule {}
