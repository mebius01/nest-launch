import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
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

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string; }) {
    return this.authService.refresh(body.refreshToken);
  }

  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('logout')
  async logout(@Req() req) {
    const userId = req.user.user_id;
    return this.authService.logout(userId);
  }

  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('logout-all')
  async logoutAll() {
    return this.authService.logoutAll();
  }
}