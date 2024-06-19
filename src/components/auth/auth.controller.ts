import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import {  AuthLocalService } from './auth.service';
import { AuthDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService:  AuthLocalService) { }

  @Post('sign-up')
  create(@Body() body: AuthDto) {
    return this.authService.create(body);
  }

  @Post('sign-in')
  login(@Body() body: AuthDto) {
    return this.authService.login(body);
  }
}