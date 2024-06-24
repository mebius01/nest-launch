import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RedisService } from '../../../services/redis/redis.service';
import { TokenService, TTL } from '../../../services/token/token.service';
import { randomBytes } from 'crypto';
import { TTokenResponse } from 'src/services/token/token.type';
import { AuthOtpDal } from './otp.dal';
import { MailService } from '../../../services/mail/mail.service';
import { QueueService } from '../../../services/queue/queue.service';

@Injectable()
export class AuthOtpService {
  private readonly length = 6;
  constructor(
    private readonly dal: AuthOtpDal,
    private readonly redis: RedisService,
    private readonly tokenService: TokenService,
    private readonly queueService: QueueService
  ) { }

  generateOtp(): string {
    return randomBytes(this.length).toString('hex').slice(0, this.length);
  }

  async createOtp(email: string): Promise<void> {
    const user = await this.dal.getUserByEmail(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const otpCode = this.generateOtp();
    const redisKey = this.redis.generateKey('otp', user.user_id, otpCode)
    await this.redis.set(redisKey, user, TTL.FIFTEEN_MINUTES);

    await this.queueService.add('sendOtp', { user, otpCode })
  }

  async verifyOtp(otp_code: string): Promise<TTokenResponse> { 
    const [key] = await this.redis.keys(`otp:*:${otp_code}`);
    const user = await this.redis.get(key);
    if (!user) {
      throw new UnauthorizedException();
    }
    const access_token = await this.tokenService.create(user);
    return { access_token };
  }
}