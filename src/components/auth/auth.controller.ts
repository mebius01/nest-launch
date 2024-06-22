import {
  Controller,
  Post,
  Body,
  Delete,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {  AuthLocalService } from './auth.service';
import { AuthDto } from './auth.dto';
import { TokenGuard } from '../../services/token/token.guard';
import { TokenService } from '../../services/token/token.service';

@Controller('auth/local')
export class AuthController {
  constructor(
    private readonly authService: AuthLocalService,
    private readonly tokenService: TokenService
  ) { }

  @Post('sign-up')
  create(@Body() body: AuthDto) {
    return this.authService.create(body);
  }

  @Post('sign-in')
  login(@Body() body: AuthDto) {
    return this.authService.login(body);
  }

  @UseGuards(TokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('logout')
  logout(@Req() req: any) {
    console.log('[34mauth.controller.ts:[33m37[35m(req)[37m', req);
    // const userId = req.user.user_id;
    // return this.authService.logout(userId);
  }

  @UseGuards(TokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('logout-all')
  logoutAll() {
    // return this.authService.logoutAll();
  }
}