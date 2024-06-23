import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './auth.dto';
import {  AuthLocalDal } from './auth.dal';
import { TUser } from '../users/users.type';
import { RedisService } from '../../services/redis/redis.service';
import { TokenService } from '../../services/token/token.service';


@Injectable()
export class  AuthLocalService {
  constructor(
    private readonly authDal: AuthLocalDal,
    private readonly redis: RedisService,
    private readonly tokenService: TokenService
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

  async login(body: AuthDto): Promise<{ access_token: string}> {
    const getUser = await this.authDal.getUserByEmail(body.email);

    if (!getUser) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password_hash, ...user } = getUser;

    const passwordMatches = await bcrypt.compare(body.password, password_hash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const access_token = await this.tokenService.create(user);
    return { access_token };
  }
}