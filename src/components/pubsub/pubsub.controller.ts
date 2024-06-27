import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { PubSubService } from 'src/services/redis/pubsub.service';

@Controller('pubsub')
export class PubSubController {
  constructor(private readonly pubSubService: PubSubService) { }

  @Post('publish/:channel')
  async publish(@Param('channel') channel: string, @Body() message: any) {
    return await this.pubSubService.publish(channel, message);
  }

  @Get('subscribe/:channel')
  async subscribe(@Param('channel') channel: string) {
    await this.pubSubService.subscribe(channel, (message) => {
      console.log(`Message received on channel ${channel}: ${message}`);
    });
    return `Subscribed to ${channel}`;
  }

  @Post('unsubscribe/:channel')
  async unsubscribe(@Param('channel') channel: string) {
    await this.pubSubService.unsubscribe(channel);
    return `Unsubscribed from ${channel}`;
  }
}
