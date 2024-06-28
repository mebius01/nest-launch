import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { TokenService } from './token.service';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) { }

  private extractTokenFromHeader(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }
    return null;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

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