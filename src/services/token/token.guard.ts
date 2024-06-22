import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TokenService } from './token.service';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      return false;
    }

    try {
      const user = await this.tokenService.verify(token);
      if (!user) {
        return false;
      }
      request.user = user;
      return true;
    } catch (err) {
      return false;
    }
  }
}