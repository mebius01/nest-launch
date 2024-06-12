import { Module } from '@nestjs/common';
import { UsersModule } from './components/users/users.module';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration/main.config';
import { LoggerModule } from 'nestjs-pino';
import { DBService } from './services/database/database.service';
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
    DBService,
    {
      provide: MigrationService,
      useFactory: (dbService: DBService) => {
        const migrationsDir = join(__dirname, 'database', 'migrations');
        return new MigrationService(dbService, migrationsDir);
      },
      inject: [DBService],
    },
  ],
})
export class AppModule {}
