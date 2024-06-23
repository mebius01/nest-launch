import {
  Controller,
  Post,
  Body,
  Delete,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
  Param,
} from '@nestjs/common';
import {  AuthLocalService, AuthOtpService } from './auth.service';
import { AuthLocalDto, AuthOtpDto } from './auth.dto';
import { TokenGuard } from '../../services/token/token.guard';
import { TokenService } from '../../services/token/token.service';

@Controller('auth/local')
export class AuthLocalController {
  constructor(
    private readonly authLocalService: AuthLocalService,
    private readonly tokenService: TokenService
  ) { }

  //! create -> Users.create
  @Post('sign-up')
  create(@Body() body: AuthLocalDto) {
    return this.authLocalService.create(body);
  }

  @Post('sign-in')
  login(@Body() body: AuthLocalDto) {
    return this.authLocalService.login(body);
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

@Controller('auth/opt')
export class AuthOtpController {
  constructor(
    private readonly authOptService: AuthOtpService,
    private readonly tokenService: TokenService
  ) { }

  @Post()
  create(@Body() body: AuthOtpDto) {
    return this.authOptService.createOtp(body.email);
  }

  @Post(':code')
  verify(@Param('code') code: string) {
    return this.authOptService.verifyOtp(code);
  }
}