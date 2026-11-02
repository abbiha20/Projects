import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignSchedulerService } from './event.service';
import { SimpleCampaign } from '../entities/simple-campaignn.entity';
import { CampaignMessage } from '../entities/campaign-message.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SimpleCampaign, CampaignMessage])],
  providers: [CampaignSchedulerService],
  exports: [CampaignSchedulerService],
})
export class EventModule {}
