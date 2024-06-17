import { Global, Module } from '@nestjs/common';
import { DBConnection } from './connection';
import { DBMapper, QueryBuilder } from './mapper';
import { DBInitializer } from './initializer';

@Global()
@Module({
  providers: [DBConnection, DBMapper, QueryBuilder],
  exports: [DBConnection, DBMapper],
})
export class DatabaseModule {}
