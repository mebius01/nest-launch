import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from 'jsonwebtoken';
import { TUser } from "../../../components/users/users.type";
import { RedisService } from "../../../services/redis/redis.service";
import { TTL } from "../enum";
import { TJwtTokenResponse } from "../type";

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
    this.accessTokenTtl = TTL.FIFTEEN_MINUTES;
    this.refreshTokenTtl = TTL.SEVEN_DAYS;
  }

  private generateToken(payload: any, ttl: number): string {
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