import { Inject, Injectable } from "@nestjs/common";
import { MailtrapClient } from "mailtrap";
import { Logger } from "nestjs-pino";
import { EmailErrorException } from "../exceptions/exceptions";
import { ConfigService } from "@nestjs/config";
import { TUser } from "src/components/users/users.type";
import { otpTemplate, registrationTemplate } from "./mail.html";

type TMsg = {
  from: { email: string; name?: string; };
  to: { email: string; name?: string; }[];
  subject: string;
  html: string;
};

@Injectable()
export class MailService {
  constructor(
    @Inject('MAIL_CLIENT') private readonly mailClient: MailtrapClient,
    private readonly log: Logger,
    private readonly configService: ConfigService
  ) {}

  formatFromToMsg(toEmail: string) {
    return {
      from: {
        email: this.configService.get('mail').sender,
        name: 'Nest Launch'
      },
      to: [{ email: toEmail }],
    };
  }

  async send(msg: TMsg) {
    if (process.env.NODE_ENV === 'development') {
      this.log.warn(msg);
      return;
    }
    try {
      const data = await this.mailClient.send(msg);
      if (!data.success) this.log.error(data);
    } catch (error) {
      this.log.error(error);
      throw new EmailErrorException();
    }
  }

  async otp(user:TUser, code: string): Promise<void> {
    const html = otpTemplate(user.user_name, code);
    const msg: TMsg = {
      ...this.formatFromToMsg(user.email),
      subject: 'Your OTP Code',
      html,
    };
    await this.send(msg);
  }

  async registration(user: TUser): Promise<void> {
    const html = registrationTemplate(user.user_name);
    const msg: TMsg = {
      ...this.formatFromToMsg(user.email),
      subject: 'Welcome to Our Service',
      html,
    };
    await this.send(msg);
  }
  
}