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

  async keys(pattern?: string): Promise<string[]> {
    try {
      let values
      if (!pattern) {
        values = await this.redis.keys('*');
      }
      values = await this.redis.keys(pattern);
      return values
    } catch (error) {
      this.log.error(error);
      throw new RedisErrorException();
    }
  }

  async setSession(key: string, value: any, expires: number): Promise<string> {
    try {
      const valueString = JSON.stringify(value);
      return await this.redis.set(key, valueString, 'EX', expires);
    } catch (error) {
      this.log.error(error);
      throw new RedisErrorException();
    }
  }

  async expire(key: string, expires: number): Promise<number> {
    try {
      return await this.redis.expire(key, expires);
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

  async delByPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        return await this.redis.del(...keys);
      }
      return 0;
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
