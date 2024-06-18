import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { RedisErrorException } from '../exceptions/exceptions';
import Redis from 'ioredis';

export type RedisClient = Redis;

@Injectable()
export class RedisService {
  public constructor(
    @Inject('REDIS_CLIENT') private readonly redis: RedisClient,
    private readonly log: Logger,
  ) { }

  async ping() {
    try {
      return await this.redis.ping();
    } catch (error) {
      this.log.error(error);
      throw new RedisErrorException();
    }
  }
}

