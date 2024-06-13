import { Module } from '@nestjs/common';
import { UsersModule } from './components/users/users.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration/main.config';
import { LoggerModule } from 'nestjs-pino';
import { DBConnection } from './services/database/database.service';
import { MigrationService } from './services/migration/migration.service';
import { join } from 'path';

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
  providers: [
    DBConnection,
    {
      provide: MigrationService,
      useFactory: (DBConnection: DBConnection) => {
        const migrationsDir = join(__dirname, 'database', 'migrations');
        return new MigrationService(DBConnection, migrationsDir);
      },
      inject: [DBConnection],
    },
  ],
})
export class AppModule {}
