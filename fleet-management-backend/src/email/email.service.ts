// src/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const service = this.configService.get<string>('EMAIL_SERVICE');
    const user = this.configService.get<string>('EMAIL_USER');
    const pass = this.configService.get<string>('EMAIL_PASS');

    if (!service || !user || !pass) {
      this.logger.error('Email service configuration is missing.');
      throw new Error('Email service configuration is missing.');
    }

    this.transporter = nodemailer.createTransport({
      service,
      port: 587,
      secure: false,
      auth: {
        user,
        pass,
      },
    });

    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('Error with email transporter configuration:', error);
      } else {
        this.logger.log('Email transporter is ready to send messages.');
      }
    });
  }

  /**
   * @param to Recipient
   * @param subject subject
   * @param text text
   * @param html html content but it is optional
   * @returns response
   */
  async sendMail(
    to: string,
    subject: string,
    text: string,
    html?: string,
  ): Promise<nodemailer.SentMessageInfo> {
    const from = this.configService.get<string>('EMAIL_USER');

    const mailOptions: nodemailer.SendMailOptions = {
      from,
      to,
      subject,
      text,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }
}
