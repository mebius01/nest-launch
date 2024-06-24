import {
  Controller,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { AuthOtpService } from './otp.service';
import { AuthOtpDto } from './otp.dto';


@Controller('auth/opt')
export class AuthOtpController {
  constructor(private readonly authOptService: AuthOtpService,) { }

  @Post()
  create(@Body() body: AuthOtpDto) {
    return this.authOptService.createOtp(body.email);
  }

  @Post(':code')
  verify(@Param('code') code: string) {
    return this.authOptService.verifyOtp(code);
  }
}