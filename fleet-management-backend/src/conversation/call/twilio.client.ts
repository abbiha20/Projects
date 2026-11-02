import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class TwilioClient {
  private readonly client: twilio.Twilio;
  private readonly logger = new Logger(TwilioClient.name);

  constructor(private configService: ConfigService) {
    this.client = twilio(
      this.configService.get('twilio.accountSid'),
      this.configService.get('twilio.authToken'),
    );
  }

  async generateTwilioToken(userId: string) {
    try {
      const accountSid = this.configService.get('TWILIO_ACCOUNT_SID');
      const apiKeySid = this.configService.get('TWILIO_API_KEY_SID');
      const apiKeySecret = this.configService.get('TWILIO_API_SECRET');
      const twimlAppSid = this.configService.get('TWILIO_TWIML_APP_SID');

      const accessToken = new twilio.jwt.AccessToken(
        accountSid,
        apiKeySid,
        apiKeySecret,
        {
          identity: userId,
          ttl: 3600,
        },
      );

      const voiceGrant = new twilio.jwt.AccessToken.VoiceGrant({
        outgoingApplicationSid: twimlAppSid,
        incomingAllow: true,
      });

      accessToken.addGrant(voiceGrant);

      return {
        token: accessToken.toJwt(),
        identity: userId,
      };
    } catch (error) {
      this.logger.error(`Token generation failed: ${error.message}`);
      throw error;
    }
  }

  // Add method for call transfers
  async transferCall(callSid: string, transferTo: string) {
    try {
      return await this.client.calls(callSid).update({
        twiml: new twilio.twiml.VoiceResponse()
          .dial({ callerId: this.configService.get('TWILIO_PHONE_NUMBER') })
          .number(transferTo)
          .toString(),
      });
    } catch (error) {
      this.logger.error(`Error transferring call: ${error.message}`);
      throw error;
    }
  }
}
