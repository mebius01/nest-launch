import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthOtpService } from './otp.service';
import { AuthOtpDto } from './otp.dto';


@Controller('auth/opt')
export class AuthOtpController {
  constructor(private readonly authOptService: AuthOtpService,) { }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post()
  create(@Body() body: AuthOtpDto) {
    return this.authOptService.createOtp(body.email);
  }

  @Post(':code')
  verify(@Param('code') code: string) {
    return this.authOptService.verifyOtp(code);
  }
}