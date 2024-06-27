import { Module } from '@nestjs/common';
import { PubSubController } from './pubsub.controller';

@Module({
  controllers: [PubSubController],
  providers: [],
})
export class PubSubModule { }
