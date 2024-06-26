import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from "../../redis/redis.service";
import { TUser } from '../../../components/users/users.type';
import { TTL } from '../enum';

@Injectable()
export class TokenService {
  constructor(
    private readonly redisService: RedisService,
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
