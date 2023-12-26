import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersDal } from './users.dal';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersDal],
})
export class UsersModule {}
