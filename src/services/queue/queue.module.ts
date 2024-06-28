import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueService } from './queue.service';
import { QueueProcessor } from './queue.processor';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis').host,
          port: configService.get('redis').port,
          password: configService.get('redis').password
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({name: 'email' }),
  ],
  providers: [
    QueueService,
    QueueProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule { }
