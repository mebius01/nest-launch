import { Module } from '@nestjs/common';
import { AuthController } from './auth.contraller';
import { AuthLocalModule } from './local/local.module';
import { AuthOtpModule } from './otp/otp.module';


@Module({
  controllers: [AuthController],
  imports: [AuthLocalModule, AuthOtpModule],
})
export class AuthModule { }