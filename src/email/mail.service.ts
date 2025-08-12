
import { AllConfigType } from '@/config/config.type';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly mailerService: MailerService,
  ) {}

  async sendEmailVerification(email: string, token: string) {

    const url = `${this.configService.get('app.url', { infer: true })}/auth/verify-email?token=${token}`;
    
    await this.mailerService.sendMail({
      to: email,
      subject: 'Xác minh tài khoản',
      template: 'email-verification',
      context: {
        email: email,
        url: url,
      },
    });
  }
}