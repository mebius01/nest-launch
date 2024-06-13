import { Global, Module } from '@nestjs/common';
import { DBConnection } from './database.service';

@Global()
@Module({
  providers: [DBConnection],
  exports: [DBConnection],
})
export class DatabaseModule {}
