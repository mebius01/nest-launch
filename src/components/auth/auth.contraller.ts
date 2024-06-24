import {
  Controller,
  Delete,
  Req,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { TokenGuard } from '../../services/token/token.guard';
import { TokenService } from '../../services/token/token.service';

@Controller('auth')
export class AuthController {
  constructor( private readonly tokenService: TokenService) { }

  @UseGuards(TokenGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('logout-session')
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
