import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { SimpleCampaign } from '../entities/simple-campaignn.entity';
import { CampaignMessage } from '../entities/campaign-message.entity';

@Injectable()
export class CampaignSchedulerService {
  private readonly logger = new Logger(CampaignSchedulerService.name);

  constructor(
    @InjectRepository(SimpleCampaign)
    private simpleCampaignRepository: Repository<SimpleCampaign>,
    @InjectRepository(CampaignMessage)
    private campaignMessageRepository: Repository<CampaignMessage>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async checkScheduledCampaigns() {
    const now = new Date();
    const scheduledCampaigns = await this.simpleCampaignRepository.find({
      where: {
        startType: 'scheduled',
        scheduledDate: LessThanOrEqual(now),
      },
      relations: ['messages'],
    });

    for (const campaign of scheduledCampaigns) {
      this.logger.log(
        `Campaign triggered: ${campaign.name} (ID: ${campaign.id})`,
      );

      for (const message of campaign.messages) {
        this.logger.log(`Message content: ${message.message}`);
        if (message.templateId) {
          this.logger.log(`Using template ID: ${message.templateId}`);
        }
        if (message.formRequestId) {
          this.logger.log(`Form request ID: ${message.formRequestId}`);
        }
        if (message.assignedReplies && message.assignedReplies.length > 0) {
          this.logger.log(
            `Assigned replies: ${message.assignedReplies.join(', ')}`,
          );
        }
        if (message.autoTranslate) {
          this.logger.log('Auto-translation is enabled');
        }
        if (message.confirmationText) {
          this.logger.log(`Confirmation text: ${message.confirmationText}`);
        }
        if (message.optOutMessage) {
          this.logger.log(`Opt-out message: ${message.optOutMessage}`);
        }
        if (message.shortenedUrls && message.shortenedUrls.length > 0) {
          this.logger.log(
            `Shortened URLs: ${message.shortenedUrls.join(', ')}`,
          );
        }
      }

      campaign.startType = 'immediate';
      await this.simpleCampaignRepository.save(campaign);
    }
  }
}
