import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import { PubSubService } from './pubsub.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get('redis').url;
        return new Redis(redisUrl);
      },
      inject: [ConfigService],
    },
    RedisService,
    PubSubService,
  ],
  exports: [RedisService, PubSubService],
})
export class RedisModule { }

