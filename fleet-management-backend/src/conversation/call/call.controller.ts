import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Logger,
  Get,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UnauthorizedException,
} from '@nestjs/common';
import { CallService } from './call.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import { Public } from '../../auth/public.decorator';

@Controller('api/call')
export class CallController {
  private readonly logger = new Logger(CallController.name);

  constructor(
    private readonly callService: CallService,
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('token')
  async generateVoiceToken(
    @Req() req,
    @Query('platform') platform?: 'ios' | 'android',
  ) {
    try {
      // Get Twilio config using new structure
      const twilioConfig = this.configService.get('twilio');
      const userId = req.user.userId;

      if (
        !twilioConfig.accountSid ||
        !twilioConfig.apiKeySid ||
        !twilioConfig.apiSecret ||
        !twilioConfig.twimlAppSid
      ) {
        throw new Error('Missing required Twilio configuration');
      }

      // Create access token with user identity
      const accessToken = new twilio.jwt.AccessToken(
        twilioConfig.accountSid,
        twilioConfig.apiKeySid,
        twilioConfig.apiSecret,
        {
          identity: userId,
          ttl: 86400,
        },
      );

      // Get platform-specific push credential
      let pushCredentialSid: string | undefined;
      if (platform === 'ios') {
        pushCredentialSid = twilioConfig.pushCredentials.ios;
      } else if (platform === 'android') {
        pushCredentialSid = twilioConfig.pushCredentials.android;
      }

      // Create Voice grant
      const voiceGrant = new twilio.jwt.AccessToken.VoiceGrant({
        outgoingApplicationSid: twilioConfig.twimlAppSid,
        incomingAllow: true,
        pushCredentialSid,
      });

      accessToken.addGrant(voiceGrant);
      accessToken.identity = userId;

      return {
        token: accessToken.toJwt(),
        identity: userId,
        ttl: 86400,
        permissions: {
          incomingAllow: true,
          outgoingAllow: true,
          recordingEnabled: twilioConfig.callSettings.recordingEnabled,
        },
        config: {
          twilioAccountSid: twilioConfig.accountSid,
          twimlAppSid: twilioConfig.twimlAppSid,
          pushEnabled: !!pushCredentialSid,
          platform,
          defaultRegion: twilioConfig.region,
          audioConstraints: twilioConfig.callSettings.audioConstraints,
          maxCallDuration: twilioConfig.callSettings.maxCallDuration,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to generate voice token: ${error.message}`);
      throw new UnauthorizedException('Failed to generate voice token');
    }
  }

  @Post('refresh-token')
  async refreshToken(@Req() req) {
    return this.generateVoiceToken(req);
  }

  @Public()
  @Post('voice-twiml')
  async generateVoiceTwiml(
    @Body()
    body: {
      To: string;
      From: string;
      CallSid: string;
      Direction: 'inbound' | 'outbound-api';
    },
  ) {
    const twilioConfig = this.configService.get('twilio');
    const twiml = new twilio.twiml.VoiceResponse();

    try {
      if (body.Direction === 'inbound') {
        twiml.say('Welcome to our service');
      } else {
        twiml
          .dial({
            callerId: twilioConfig.fromPhoneNumber,
            answerOnBridge: true,
            record: 'do-not-record',
          })
          .number(body.To);
      }

      return twiml.toString();
    } catch (error) {
      this.logger.error(`Failed to generate voice TwiML: ${error.message}`);
      twiml.say(
        {
          voice: 'alice',
          language: 'en-US',
        },
        'An error occurred. Please try again later.',
      );
      return twiml.toString();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify-caller')
  async verifyCallerIdentity(
    @Body() body: { phoneNumber: string; countryCode?: string },
  ) {
    try {
      const twilioConfig = this.configService.get('twilio');
      const client = twilio(twilioConfig.accountSid, twilioConfig.authToken);

      const lookup = await client.lookups.v2
        .phoneNumbers(body.phoneNumber)
        .fetch({ countryCode: body.countryCode });

      return {
        valid: lookup.valid,
        phoneNumber: lookup.phoneNumber,
        countryCode: lookup.countryCode,
      };
    } catch (error) {
      this.logger.error(`Failed to verify caller identity: ${error.message}`);
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('call-feedback')
  async submitCallFeedback(
    @Body() body: { callSid: string; quality: number; issue?: string[] },
  ) {
    try {
      const client = twilio(
        this.configService.get('TWILIO_ACCOUNT_SID'),
        this.configService.get('TWILIO_AUTH_TOKEN'),
      );
      // await client.calls(body.callSid).feedback().create({
      //   qualityScore: body.quality,
      //   issue: body.issue,
      // });

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to submit call feedback: ${error.message}`);
      throw error;
    }
  }

  @Public()
  @Post('status-callback')
  async handleCallStatus(@Body() statusCallback: any) {
    return this.callService.handleCallStatusCallback(statusCallback);
  }

  @Public()
  @Post('recording-complete')
  async handleRecordingComplete(@Body() recordingData: any) {
    return this.callService.handleRecordingStatus(recordingData);
  }

  @Public()
  @Post('call-completed')
  async handleCallCompleted(@Body() callData: any) {
    return this.callService.handleCallCompleted(callData);
  }

  @Public()
  @Post('inbound')
  async handleInboundCall(@Body() twilioParams: any) {
    return this.callService.handleInboundCall(twilioParams);
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  async getAllCalls(
    @Query('direction') direction: 'inbound' | 'outbound',
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('contactId') contactId?: string,
  ) {
    return this.callService.getAllCalls(direction, limit, page, contactId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('status')
  async getCallStatus(@Body() body: { callSid: string }) {
    return this.callService.getCallStatus(body.callSid);
  }

  @UseGuards(JwtAuthGuard)
  @Post('end-call')
  async endCall(@Body() body: { callSid: string }) {
    return this.callService.endCall(body.callSid);
  }
}
