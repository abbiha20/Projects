import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { SimpleCampaignController } from './simple-campaign/simple-campaign/simple-campaign.controller';
import { AutomatedCampaignController } from './automated-campaign/automated-campaign/automated-campaign.controller';

// Services
import { SimpleCampaignService } from './simple-campaign/simple-campaign/simple-campaign.service';
import { AutomatedCampaignService } from './automated-campaign/automated-campaign/automated-campaign.service';
import { ShortUrlService } from './shared/services/short-url/short-url.service';
import { CampaignMessageService } from './shared/services/campaign-message/campaign-message.service';

// Entities
import { ShortUrl } from '../entities/short-url.entity';
import { SimpleCampaign } from '../entities/simple-campaignn.entity';
import { AutomatedCampaign } from '../entities/automated-message.entity';
import { CampaignMessage } from '../entities/campaign-message.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      ShortUrl,
      SimpleCampaign,
      AutomatedCampaign,
      CampaignMessage,
    ]),
  ],
  controllers: [SimpleCampaignController, AutomatedCampaignController],
  providers: [
    SimpleCampaignService,
    AutomatedCampaignService,
    ShortUrlService,
    CampaignMessageService,
  ],
})
export class CampaignModule {}
