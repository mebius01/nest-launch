import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from 'nestjs-pino';

@Injectable()
export class TasksService {
  constructor(private readonly logger: Logger) { }

  @Cron(CronExpression.EVERY_MINUTE)
  cron() {
    // Logic here
    this.logger.log(`Cron EVERY_MINUTE: ${CronExpression.EVERY_MINUTE}`);
  }
}

