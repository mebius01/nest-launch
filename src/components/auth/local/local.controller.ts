import { Controller, Post, Body, } from '@nestjs/common';
import { AuthLocalService } from './local.service';
import { AuthLocalDto } from './local.dto';

@Controller('auth/local')
export class AuthLocalController {
  constructor(private readonly authLocalService: AuthLocalService) { }

  @Post('login')
  login(@Body() body: AuthLocalDto) {
    return this.authLocalService.login(body);
  }
}
