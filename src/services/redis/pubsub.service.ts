import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { Logger } from "nestjs-pino";
import { RedisErrorException } from "../exceptions/exceptions";

@Injectable()
export class PubSubService {
  private readonly subscriber: Redis;
  private readonly publisher: Redis;
  private readonly messageHandlers: Map<string, (message: string) => void>;

  public constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly log: Logger,
  ) {
    this.subscriber = new Redis();
    this.publisher = new Redis();
    this.messageHandlers = new Map();

    this.subscriber.on('message', (channel, message) => {
      const handler = this.messageHandlers.get(channel);
      if (handler) {
        handler(message);
      }
    });
  }

  async publish(channel: string, message: any): Promise<number> {
    try {
      const messageString = JSON.stringify(message);
      return await this.publisher.publish(channel, messageString);
    } catch (error) {
      this.log.error(error);
      throw new RedisErrorException();
    }
  }

  async subscribe(channel: string, handler: (message: string) => void): Promise<void> {
    try {
      this.messageHandlers.set(channel, handler);
      await this.subscriber.subscribe(channel);
    } catch (error) {
      this.log.error(error);
      throw new RedisErrorException();
    }
  }

  async unsubscribe(channel: string): Promise<void> {
    try {
      await this.subscriber.unsubscribe(channel);
    } catch (error) {
      this.log.error(error);
      throw new RedisErrorException();
    }
  }
}