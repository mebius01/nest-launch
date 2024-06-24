import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisService } from '../../../services/redis/redis.service';
import { TokenService, TTL } from '../../../services/token/token.service';
import { randomBytes } from 'crypto';
import { TTokenResponse } from 'src/services/token/token.type';
import { AuthOtpDal } from './otp.dal';

@Injectable()
export class AuthOtpService {
  private readonly length = 6;
  constructor(
    private readonly dal: AuthOtpDal,
    private readonly redis: RedisService,
    private readonly tokenService: TokenService
  ) { }

  generateOtp(): string {
    return randomBytes(this.length).toString('hex').slice(0, this.length);
  }

  async createOtp(email: string): Promise<void> {
    const user = await this.dal.getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const otpCode = this.generateOtp();
    const redisKey = this.redis.generateKey('otp', user.user_id, otpCode)
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