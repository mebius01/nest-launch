import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { MailService } from '../mail/mail.service';

@Processor('email')
export class QueueProcessor {
  constructor(private readonly mailService: MailService) { }

  @Process('sendEmail')
  async handleSendEmail(job: Job<any>) {
    const { msg } = job.data;
    await this.mailService.send(msg);
  }

  @Process('sendOtp')
  async handleSendOtp(job: Job<any>) {
    const { user, code } = job.data;
    await this.mailService.otp(user, code);
  }

  @Process('sendRegistration')
  async handleSendRegistration(job: Job<any>) {
    const { user } = job.data;
    await this.mailService.registration(user);
  }
}
