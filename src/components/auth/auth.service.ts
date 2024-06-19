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

  async login(body: AuthDto):Promise<string> {
    const jwtConfig = this.configService.get('jwt');
    const { password_hash, ...user } = await this.authDal.getUserByEmail(body.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(body.password, password_hash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }
 

    const token: TToken = {
      user_id: user.user_id,
      token: jwt.sign({ id: user.user_id }, jwtConfig.secret, { expiresIn: jwtConfig.expiresIn }),
      expires_at: new Date(Date.now() + 3600000),
    }
    await this.authDal.setToken(token);
    const redisKey = `session:${user.user_id}:${uuidv4()}`
    await this.redis.set(redisKey, user);

    return token.token;
  }
}