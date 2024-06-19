import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { RedisService } from '../services/redis/redis.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly redis: RedisService,
    private reflector: Reflector
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const secret = this.configService.get('jwt').secret;
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return false;
    }

    try {
      const payload = jwt.verify(token, secret) as jwt.JwtPayload;
      const { user_id } = payload;
      const [key] = await this.redis.keys(`session:${user_id}*`);

      if (!key) {
        return false;
      }

      const user = await this.redis.get(key);
      request.user = user;
      return true;
    } catch (err) {
      return false;
    }
  }
}