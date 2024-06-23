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
    const accessToken = req.headers.authorization?.split(' ')[1];
    this.tokenService.logoutForSession(accessToken);
  }
  
  @UseGuards(TokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('logout-user')
  logoutForUser(@Req() req: any) { 
    const userId = req.user.user_id;
    this.tokenService.logoutForUser(userId);
  }

  @UseGuards(TokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('logout-all')
  logoutAll() {
    this.tokenService.logoutAll();
  }
}