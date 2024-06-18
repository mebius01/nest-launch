import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDal } from './auth.dal';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { UsersDal } from '../users/users.dal';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthDal],
})
export class AuthModule { }