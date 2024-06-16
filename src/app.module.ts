import { Module } from '@nestjs/common';
import { UsersModule } from './components/users/users.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration/main.config';
import { LoggerModule } from 'nestjs-pino';
import { DBConnection } from './services/database/connection';
import { DBMigration } from './services/database/migration';
import { join } from 'path';
import { DatabaseModule } from './services/database/database.module';

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
  ],
})
export class AppModule {}
