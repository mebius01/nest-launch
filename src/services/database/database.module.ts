import { Global, Module } from '@nestjs/common';
import { DBConnection } from './database.service';
import { DBMapper } from './database.mapper';

@Global()
@Module({
  providers: [DBConnection, DBMapper],
  exports: [DBConnection, DBMapper],
})
export class DatabaseModule {}
