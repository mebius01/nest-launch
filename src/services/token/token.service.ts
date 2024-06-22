import { ConfigService } from '@nestjs/config';
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from "../redis/redis.service";
import { TUser } from '../../components/users/users.type';
@Injectable()
export class TokenService {
  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService
  ) { }

  private createSession(user: TUser) {
    const token = uuidv4();
    const data = {
      access_token: `session:${user.user_id}:${token}`,
      value: user,
      expires: this.configService.get('ex')
    };
    return data;
  }

  async create(user: TUser): Promise<string> {
    const session = this.createSession(user);
    await this.redisService.setSession(session.access_token, session.value, session.expires);
    return session.access_token;
  }

  async verify(accessToken: string): Promise<TUser | null> {
    const user = await this.redisService.get(accessToken);
    if (user) {
      await this.redisService.expire(accessToken, this.configService.get('ex'));
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
    await this.redisService.delAll();
  }

}