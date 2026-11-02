import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import axios from 'axios';
import * as mime from 'mime-types';

@Injectable()
export class SendSmsService {
  private twilioClient: Twilio;
  private fromNumber: string;
  private readonly logger = new Logger(SendSmsService.name);

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('twilio.accountSid');
    const authToken = this.configService.get<string>('twilio.authToken');
    this.fromNumber = this.configService.get<string>('twilio.fromPhoneNumber');

    if (!accountSid || !authToken || !this.fromNumber) {
      throw new Error('Missing Twilio configuration');
    }

    this.twilioClient = new Twilio(accountSid, authToken, {
      lazyLoading: true,
      region: 'us1',
    });
  }
  async sendMessage(
    toNumber: string,
    message: string,
    fileURLs?: string[],
  ): Promise<{ success: boolean; error?: string; sid?: string }> {
    try {
      const formattedToNumber = this.formatPhoneNumber(toNumber);

      let mediaUrls: string[] = [];
      if (fileURLs && fileURLs.length > 0) {
        mediaUrls = await this.processFileURLs(fileURLs);
      }
      // If no message content and no valid media URLs, return error
      if (!message && (!mediaUrls || mediaUrls.length === 0)) {
        return {
          success: false,
          error: 'Either message content or valid media files must be provided',
        };
      }
      const messageOptions: any = {
        from: this.fromNumber,
        to: formattedToNumber,
      };
      // Only add body if message is not empty
      if (message) {
        messageOptions.body = message;
      }
      // Add media URLs if available
      if (mediaUrls.length > 0) {
        messageOptions.mediaUrl = mediaUrls;
      }

      const response = await this.twilioClient.messages.create(messageOptions);

      if (response.sid && response.status !== 'failed') {
        this.logger.log(
          `Message sent successfully to ${formattedToNumber}. SID: ${response.sid}`,
        );
        return { success: true, sid: response.sid };
      } else {
        this.logger.warn(
          `Message to ${formattedToNumber} may have failed. Status: ${response.status}`,
        );
        return { success: false, error: `Message status: ${response.status}` };
      }
    } catch (error) {
      this.logger.error(
        `Error sending message to ${toNumber}: ${error.message}`,
        error.stack,
      );

      if (error.code === 21608) {
        return {
          success: false,
          error: `The number ${toNumber} is unverified. Please verify it in your Twilio account or upgrade to a paid account.`,
        };
      }

      if (error.code === 21211) {
        return { success: false, error: 'Invalid phone number format.' };
      }

      if (
        error.message.includes('Permission to send an SMS has not been enabled')
      ) {
        return {
          success: false,
          error:
            'Message sending is not enabled for this region. Please contact Twilio support to enable this feature.',
        };
      }

      return { success: false, error: error.message };
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber.startsWith('+')) {
      return `+${phoneNumber}`;
    }
    return phoneNumber;
  }

  private async processFileURLs(fileURLs: string[]): Promise<string[]> {
    const processedUrls: string[] = [];

    for (const url of fileURLs) {
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'];
        const fileExtension = mime.extension(contentType);

        if (this.isSupportedFileType(fileExtension)) {
          processedUrls.push(url);
        } else {
          this.logger.warn(
            `Unsupported file type: ${fileExtension} for URL: ${url}`,
          );
        }
      } catch (error) {
        this.logger.error(`Error processing file URL ${url}: ${error.message}`);
      }
    }

    return processedUrls;
  }

  private isSupportedFileType(fileExtension: string | false): boolean {
    const supportedTypes = ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'doc', 'docx'];
    return !!fileExtension && supportedTypes.includes(fileExtension);
  }

  async sendMessageWithRetry(
    toNumber: string,
    message: string,
    fileURLs?: string[],
    maxRetries = 3,
    delay = 1000,
  ): Promise<{ success: boolean; error?: string; sid?: string }> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const result = await this.sendMessage(toNumber, message, fileURLs);
      if (result.success) return result;

      this.logger.warn(`Attempt ${attempt} failed: ${result.error}`);
      if (attempt === maxRetries) {
        return {
          success: false,
          error: `Failed after ${maxRetries} attempts: ${result.error}`,
        };
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    return { success: false, error: 'Max retries reached' };
  }
}
