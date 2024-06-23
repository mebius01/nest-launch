import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthLocalDto } from './auth.dto';
import {  AuthLocalDal } from './auth.dal';
import { TUser } from '../users/users.type';
import { RedisService } from '../../services/redis/redis.service';
import { TokenService, TTL } from '../../services/token/token.service';
import { randomBytes } from 'crypto';
import { TAuthOtp } from './auth.type';
import { TTokenResponse } from 'src/services/token/token.type';


@Injectable()
export class  AuthLocalService {
  constructor(
    private readonly authDal: AuthLocalDal,
    private readonly tokenService: TokenService
  ) { }

  //! create -> Users.create
  async create(body: AuthLocalDto): Promise<TUser> {
    const user: TUser = {
      email: body.email,
      user_name: body.email.split('@')[0],
    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(body.password, salt);
    const data = await this.authDal.create(user, password_hash);
    return data
  }

  async login(body: AuthLocalDto): Promise<TTokenResponse> {
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

@Injectable()
export class AuthOtpService {
  private readonly length = 6;
  constructor(
    private readonly authDal: AuthLocalDal,
    private readonly redis: RedisService,
    private readonly tokenService: TokenService
  ) { }

  generateOtp(): string {
    return randomBytes(this.length).toString('hex').slice(0, this.length);
  }

  async createOtp(email: string): Promise<void> {
    const getUser = await this.authDal.getUserByEmail(email);

    if (!getUser) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password_hash, ...user } = getUser;

    const otpCode = this.generateOtp();
    const redisKey = this.redis.generateKey('otp', getUser.user_id, otpCode)

    await this.redis.set(redisKey, user, TTL.FIFTEEN_MINUTES);

    //! send data to mailService
    console.log('send data to mailService', otpCode);
  }

  async verifyOtp(otp_code: string): Promise<TTokenResponse> { 
    const user = await this.redis.get(`otp:*:${otp_code}`);
    if (!user) {
      throw new UnauthorizedException();
    }
    const access_token = await this.tokenService.create(user);
    return { access_token };
  }
}