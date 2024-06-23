import { ConfigService } from '@nestjs/config';
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from "../redis/redis.service";
import { TUser } from '../../components/users/users.type';
import * as jwt from 'jsonwebtoken';
import { TJwtTokenResponse } from './token.type';

export enum TTL {
  TEN_MINUTES = 600,     // 10 * 60
  FIFTEEN_MINUTES = 900, // 15 * 60
  ONE_DAY = 86400,       // 24 * 60 * 60
  SEVEN_DAYS = 604800,   // 7 * 24 * 60 * 60
}

@Injectable()
export class TokenService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService
  ) { }

  private createSession(user: TUser): { key: string, value: TUser, ttl: number } {
    const sessionId = uuidv4();
    const data = {
      key: this.redisService.generateKey('session', user.user_id, sessionId),
      value: user,
      ttl: TTL.ONE_DAY
    };
    return data;
  }

  async create(user: TUser): Promise<string> {
    const session = this.createSession(user);
    const {key, value, ttl} = session;
    await this.redisService.set(key, value, ttl);
    return session.key;
  }

  async verify(accessToken: string): Promise<TUser | null> {
    const user = await this.redisService.get(accessToken);
    if (user) {
      await this.redisService.expire(accessToken, TTL.ONE_DAY);
      return user;
    }
    return null;
  }

  async logoutForSession(accessToken: string): Promise<void> {
    await this.redisService.del(accessToken);
  }

  async logoutForUser(user_id: number): Promise<void> {
    await this.redisService.delByPattern(`session:${user_id}:*`);
  }

  async logoutAll(): Promise<void> {
    await this.redisService.delByPattern('session:*:*');
  }

}

@Injectable()
export class JwtService {
  private readonly jwtSecret: string;
  private readonly accessTokenTtl: number;
  private readonly refreshTokenTtl: number;
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService
  ) { 
    this.jwtSecret = this.configService.get('jwt').secret;
    this.accessTokenTtl = TTL.FIFTEEN_MINUTES
    this.refreshTokenTtl = TTL.SEVEN_DAYS
  }

  private generateToken(payload:any, ttl: number): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: ttl });
  }

  private generateAccessToken(user: TUser): string {
    return this.generateToken(user, this.accessTokenTtl);
  }

  private generateRefreshToken(user: TUser): string {
    return this.generateToken(user, this.refreshTokenTtl);
  }

  decodeToken(token: string): any {
    return jwt.decode(token);
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      return null;
    }
  }

  async createTokens(user: TUser): Promise<TJwtTokenResponse> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    await this.redisService.set(`refresh:${user.user_id}:${refreshToken}`, user, this.refreshTokenTtl);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshToken(refreshToken: string, user_id: number): Promise<TJwtTokenResponse | null> {
    try {
      const user = await this.redisService.get(`refresh:${user_id}:${refreshToken}`);

      if (!user || user.user_id !== user_id) {
        return null;
      }

      const decoded = this.verifyToken(refreshToken) as TUser;

      if (!decoded || decoded.user_id !== user.user_id) {
        return null;
      }
      const newAccessToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);
      await this.redisService.del(`refresh:${user_id}:${refreshToken}`);
      await this.redisService.set(`refresh:${user_id}:${newRefreshToken}`, decoded, this.refreshTokenTtl);
      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      };
    } catch (error) {
      return null;
    }
  }

  async logoutForUser(user_id: number): Promise<void> {
    await this.redisService.delByPattern(`refresh:${user_id}:*`);
  }

  async logoutAll(): Promise<void> {
    await this.redisService.delByPattern('refresh:*:*');
  }
}