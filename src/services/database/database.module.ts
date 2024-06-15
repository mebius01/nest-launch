import { Global, Module } from '@nestjs/common';
import { DBConnection } from './connection';
import { DBMapper } from './mapper';

@Global()
@Module({
  providers: [DBConnection, DBMapper],
  exports: [DBConnection, DBMapper],
})
export class DatabaseModule {}
