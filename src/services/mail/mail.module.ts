import { Global, Module } from '@nestjs/common';
import { MailtrapClient } from 'mailtrap';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'MAIL_CLIENT',
      useFactory: (configService: ConfigService) => {
        const token = configService.get('mail').token;
        return new MailtrapClient({ token });
      },
      inject: [ConfigService],
    },
    MailService],
  exports: [MailService],
})
export class MailModule { }