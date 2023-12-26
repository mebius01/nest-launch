import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthDal } from './auth.dal';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthDal],
})
export class AuthModule {}
