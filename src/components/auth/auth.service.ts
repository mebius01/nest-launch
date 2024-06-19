import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AuthDto } from './auth.dto';
import {  AuthLocalDal } from './auth.dal';
import { TUser } from '../users/users.type';
import { TToken } from './auth.type';
import { RedisService } from '../../services/redis/redis.service';


@Injectable()
export class  AuthLocalService {
  constructor(
    private readonly configService: ConfigService,
    private readonly authDal: AuthLocalDal,
    private readonly redis: RedisService
  ) { }

  async create(body: AuthDto): Promise<TUser> {
    const user: TUser = {
      email: body.email,
      user_name: body.email.split('@')[0],

    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(body.password, salt);
    const data = await this.authDal.create(user, password_hash);
    return data
  }

  async login(body: AuthDto):Promise<{accessToken: string, refreshToken: string}> {
    const jwtConfig = this.configService.get('jwt');
    const getUser = await this.authDal.getUserByEmail(body.email);

    if (!getUser) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password_hash, ...user } = getUser;

    const passwordMatches = await bcrypt.compare(body.password, password_hash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken: TToken = {
      user_id: user.user_id,
      token: jwt.sign({ user_id: user.user_id }, jwtConfig.secret, { expiresIn: jwtConfig.accessExpiresIn }),
      expires_at: new Date(Date.now() + 3600000),
    }

    const refreshToken: TToken = {
      user_id: user.user_id,
      token: jwt.sign({ user_id: user.user_id }, jwtConfig.secret, { expiresIn: jwtConfig.refreshExpiresIn }),
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    }
    await this.authDal.setTokens(accessToken, refreshToken);
    const redisKey = `session:${user.user_id}:${uuidv4()}`
    await this.redis.set(redisKey, user);

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token
    };
  }

  async refresh(token: string): Promise<{ accessToken: string, refreshToken: string; }> {
    const jwtConfig = this.configService.get('jwt');
    const oldRefreshToken = await this.authDal.getRefreshTokenByToken(token);
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = jwt.verify(oldRefreshToken.token, jwtConfig.secret) as jwt.JwtPayload;
    const { user_id } = payload;
    const user = await this.authDal.getUserById(user_id);

    if (!user) { 
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken: TToken = {
      user_id: user.user_id,
      token: jwt.sign({ id: user.user_id }, jwtConfig.secret, { expiresIn: jwtConfig.accessExpiresIn }),
      expires_at: new Date(Date.now() + 3600000),
    };

    const refreshToken: TToken = {
      user_id: user.user_id,
      token: jwt.sign({ user_id: user.user_id }, jwtConfig.secret, { expiresIn: jwtConfig.refreshExpiresIn }),
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    };
    await this.authDal.setTokens(accessToken, refreshToken);
    const redisKey = `session:${user.user_id}:${uuidv4()}`;
    await this.redis.set(redisKey, user);

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token
    };
  }

  async logout(user_id: number): Promise<void> {
    await this.authDal.delTokens(user_id);
    await this.redis.delByPattern(`session:${user_id}:*`);
  }

  async logoutAll(): Promise<void> {
    await this.authDal.delTokens();
    await this.redis.delByPattern('session:*');
  }
}