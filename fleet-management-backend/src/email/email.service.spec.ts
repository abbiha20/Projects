// src/email/email.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Logger } from '@nestjs/common';

// Mock nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
  let service: EmailService;
  let mockSendMail: jest.Mock;

  beforeEach(async () => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
      verify: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
      ],
      providers: [EmailService, ConfigService, Logger],
    }).compile();

    service = module.get<EmailService>(EmailService);

    // Mock environment variables
    const configService = module.get<ConfigService>(ConfigService);
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      const env = {
        EMAIL_SERVICE: 'Gmail',
        EMAIL_USER: 'casecelerate@gmail.com',
        EMAIL_PASS: 'zfrisnevagpxbpog',
      };
      return env[key];
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send an email successfully', async () => {
    const to = 'recipient@example.com';
    const subject = 'Test Subject';
    const text = 'Test email content';
    const html = '<p>Test email content</p>';

    const result = await service.sendMail(to, subject, text, html);

    expect(mockSendMail).toHaveBeenCalledWith({
      from: 'casecelerate@gmail.com',
      to,
      subject,
      text,
      html,
    });
    expect(result).toEqual({ messageId: 'test-id' });
  });

  it('should handle sendMail error', async () => {
    mockSendMail.mockRejectedValue(new Error('Send mail failed'));

    await expect(
      service.sendMail('recipient@example.com', 'Subject', 'Content'),
    ).rejects.toThrow('Send mail failed');
  });

  it('should throw error if email configuration is missing', () => {
    // Mock missing environment variables
    const configService = service['configService'];
    jest.spyOn(configService, 'get').mockImplementation(() => null);

    expect(() => new EmailService(configService)).toThrow(
      'Email service configuration is missing.',
    );
  });
});
