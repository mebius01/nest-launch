import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('email') private readonly queue: Queue) { }

  async add(jobName: string, data: any) {
    await this.queue.add(jobName, data);
  }
}
