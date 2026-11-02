import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

interface SmsMessage {
  sid: string;
  body: string;
  from: string;
  to: string;
  dateCreated: Date;
  direction: string;
  numMedia: number;
  mediaUrls?: string[];
  mediaType?: string;
  mediaContentType?: string;
  mediaSize?: number;
  status: string;
}

@Injectable()
export class GetSmsService {
  private twilioClient: Twilio;
  private readonly logger = new Logger(GetSmsService.name);

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('twilio.accountSid');
    const authToken = this.configService.get<string>('twilio.authToken');

    if (!accountSid || !authToken) {
      this.logger.error('Missing Twilio credentials');
      throw new Error('Twilio credentials are not properly configured');
    }

    this.logger.debug(`Initializing Twilio client with account: ${accountSid}`);
    this.twilioClient = new Twilio(accountSid, authToken, {
      lazyLoading: true,
      region: 'us1',
    });
  }

  async getSmsByPhoneNumber(phoneNumber: string): Promise<SmsMessage[]> {
    this.logger.debug(`Starting SMS fetch for ${phoneNumber}`);
    const startTime = Date.now();

    try {
      const allMessages: SmsMessage[] = [];

      // Fetch messages in smaller batches with retries
      const fetchMessages = async (params: any) => {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            return await this.twilioClient.messages.list(params);
          } catch (error) {
            if (attempt === 3) throw error;
            this.logger.warn(`Attempt ${attempt} failed, retrying...`);
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          }
        }
      };

      // Fetch messages sent to the number
      this.logger.debug(`Fetching messages sent TO ${phoneNumber}`);
      const toMessages = await fetchMessages({
        to: phoneNumber,
        limit: 100, // Reduced batch size
        pageSize: 100,
      });

      if (toMessages?.length) {
        this.logger.debug(`Retrieved ${toMessages.length} 'to' messages`);
        allMessages.push(...toMessages.map(this.mapTwilioMessageToSmsMessage));
      }

      // Fetch messages sent from the number
      this.logger.debug(`Fetching messages sent FROM ${phoneNumber}`);
      const fromMessages = await fetchMessages({
        from: phoneNumber,
        limit: 100, // Reduced batch size
        pageSize: 100,
      });

      if (fromMessages?.length) {
        this.logger.debug(`Retrieved ${fromMessages.length} 'from' messages`);
        allMessages.push(
          ...fromMessages.map(this.mapTwilioMessageToSmsMessage),
        );
      }

      // Sort messages by date
      this.logger.debug('Sorting messages by date');
      allMessages.sort(
        (a, b) => a.dateCreated.getTime() - b.dateCreated.getTime(),
      );

      const duration = Date.now() - startTime;
      this.logger.log(
        `Retrieved ${allMessages.length} total messages for ${phoneNumber} in ${duration}ms`,
      );

      return allMessages;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Error fetching SMS for ${phoneNumber} after ${duration}ms: ${error.message}`,
      );

      // Return empty array instead of throwing
      return [];
    }
  }

  private mapTwilioMessageToSmsMessage(message: any): SmsMessage {
    try {
      return {
        sid: message.sid,
        body: message.body || '',
        from: message.from || '',
        to: message.to || '',
        dateCreated: new Date(message.dateCreated || Date.now()),
        direction: message.direction || 'outbound',
        numMedia: message.numMedia || 0,
        mediaUrls: message.mediaUrls || [],
        mediaType: message.mediaType || null,
        mediaContentType: message.mediaContentType || null,
        mediaSize: message.mediaSize || null,
        status: message.status || 'unknown',
      };
    } catch (error) {
      this.logger.error(
        `Error mapping Twilio message: ${JSON.stringify(message)}`,
      );
      this.logger.error(`Mapping error: ${error.message}`);
      // Return a default message instead of throwing
      return {
        sid: 'error',
        body: 'Error processing message',
        from: '',
        to: '',
        dateCreated: new Date(),
        direction: 'outbound',
        numMedia: 0,
        status: 'error',
      };
    }
  }

  async sendSms(to: string, body: string): Promise<SmsMessage> {
    const startTime = Date.now();
    this.logger.debug(`Initiating SMS send to ${to}`);
    this.logger.debug(`Message body length: ${body.length} characters`);

    try {
      this.logger.debug('Creating Twilio message');
      const message = await this.twilioClient.messages.create({
        body: body,
        to: to,
        from: this.configService.get<string>('twilio.phoneNumber'),
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `SMS sent successfully to ${to}, SID: ${message.sid} in ${duration}ms`,
      );
      this.logger.debug(`Message status: ${message.status}`);

      return this.mapTwilioMessageToSmsMessage(message);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Error sending SMS to ${to} after ${duration}ms: ${error.message}`,
      );
      this.logger.error(`Error details: ${JSON.stringify(error)}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }
}
