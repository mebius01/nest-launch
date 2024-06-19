import { Inject, Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { RedisErrorException } from '../exceptions/exceptions';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  public constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
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

  async get(key: string): Promise<any> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.log.error(error);
      throw new RedisErrorException();
    }
  }

  async list(key?: string): Promise<string[]> {
    try {
      let values
      if (!key) {
        values = await this.redis.keys('*');
      }
      values = await this.redis.keys(key);
      return values
    } catch (error) {
      this.log.error(error);
      throw new RedisErrorException();
    }
  }

  async set(key: string, value: any): Promise<string> {
    try {
      const valueString = JSON.stringify(value);
      return await this.redis.set(key, valueString);
    } catch (error) {
      this.log.error(error);
      throw new RedisErrorException();
    }
  }

  async del(key: string): Promise<number> {
    try {
      return await this.redis.del(key);
    } catch (error) {
      this.log.error(error);
      throw new RedisErrorException();
    }
  }

  async delAll(): Promise<string> {
    try {
      return await this.redis.flushdb();
    } catch (error) {
      this.log.error(error);
      throw new RedisErrorException();
    }
  }
}
