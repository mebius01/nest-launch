import { Global, Module } from '@nestjs/common';
import { DBConnection } from './connection';
import { DBMapper, QueryBuilder } from './mapper';

@Global()
@Module({
  providers: [DBConnection, DBMapper, QueryBuilder],
  exports: [DBConnection, DBMapper],
})
export class DatabaseModule {}
