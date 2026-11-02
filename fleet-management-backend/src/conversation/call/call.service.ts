import { Injectable, Logger } from '@nestjs/common';
import * as twilio from 'twilio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CallService {
  private readonly logger = new Logger(CallService.name);
  private twilioClient: twilio.Twilio;

  constructor(private readonly configService: ConfigService) {
    const twilioConfig = this.configService.get('twilio');
    this.twilioClient = twilio(twilioConfig.accountSid, twilioConfig.authToken);
  }

  async handleCallStatusCallback(statusCallback: any) {
    try {
      this.logger.log(
        `Call status update received: ${JSON.stringify(statusCallback)}`,
      );
      // Handle different call statuses
      // initiated, ringing, answered, completed
      return { success: true };
    } catch (error) {
      this.logger.error(`Error handling call status: ${error.message}`);
      throw error;
    }
  }

  async handleRecordingStatus(recordingData: any) {
    try {
      this.logger.log(
        `Recording status update received: ${JSON.stringify(recordingData)}`,
      );
      // Handle recording status updates
      return { success: true };
    } catch (error) {
      this.logger.error(`Error handling recording status: ${error.message}`);
      throw error;
    }
  }

  async handleCallCompleted(callData: any) {
    try {
      this.logger.log(`Call completed: ${JSON.stringify(callData)}`);
      // Handle call completion
      //osama add logic here database mai save krni wali ok
      return { success: true };
    } catch (error) {
      this.logger.error(`Error handling call completion: ${error.message}`);
      throw error;
    }
  }

  async handleInboundCall(twilioParams: any) {
    try {
      this.logger.log(`Inbound call received: ${JSON.stringify(twilioParams)}`);
      // Handle incoming calls
      //osama add logic here database mai save krni wali ok
      return { success: true };
    } catch (error) {
      this.logger.error(`Error handling inbound call: ${error.message}`);
      throw error;
    }
  }

  async getCallStatus(callSid: string) {
    try {
      const call = await this.twilioClient.calls(callSid).fetch();
      return {
        status: call.status,
        duration: call.duration,
        direction: call.direction,
        from: call.from,
        to: call.to,
        startTime: call.startTime,
        endTime: call.endTime,
      };
    } catch (error) {
      this.logger.error(`Error getting call status: ${error.message}`);
      throw error;
    }
  }

  async endCall(callSid: string) {
    try {
      await this.twilioClient.calls(callSid).update({ status: 'completed' });
      return { success: true };
    } catch (error) {
      this.logger.error(`Error ending call: ${error.message}`);
      throw error;
    }
  }

  async getAllCalls(
    direction: 'inbound' | 'outbound',
    limit: number,
    page: number,
    contactId?: string,
  ) {
    try {
      // Implement call listing logic here
      // You might want to fetch this from your database
      // or from Twilio's API depending on your needs
      return {
        calls: [],
        total: 0,
        page,
        limit,
      };
    } catch (error) {
      this.logger.error(`Error getting calls: ${error.message}`);
      throw error;
    }
  }
}
