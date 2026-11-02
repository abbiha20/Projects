import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SimpleCampaign } from '../../../entities/simple-campaignn.entity';
import { CampaignMessage } from '../../../entities/campaign-message.entity';
import { ShortUrlService } from '../../shared/services/short-url/short-url.service';
import { SimpleCampaignDto } from '../dto/simple-campaign.dto/simple-campaign.dto';

@Injectable()
export class SimpleCampaignService {
  constructor(
    @InjectRepository(SimpleCampaign)
    private simpleCampaignRepository: Repository<SimpleCampaign>,
    @InjectRepository(CampaignMessage)
    private campaignMessageRepository: Repository<CampaignMessage>,
    private shortUrlService: ShortUrlService,
  ) {}

  async createCampaign(
    campaignDto: SimpleCampaignDto,
    userId: string,
    phoneNumbers: string[],
  ): Promise<SimpleCampaign> {
    const campaign = new SimpleCampaign();
    campaign.name = campaignDto.name;
    campaign.createdBy = { id: userId } as any;
    campaign.startType = campaignDto.scheduledDate ? 'scheduled' : 'immediate';
    campaign.scheduledDate = campaignDto.scheduledDate
      ? new Date(campaignDto.scheduledDate)
      : null;
    campaign.phoneNumbers = phoneNumbers;

    const savedCampaign = await this.simpleCampaignRepository.save(campaign);

    const message = new CampaignMessage();
    message.message = campaignDto.message;
    message.assignedReplies = campaignDto.assignTo;
    message.autoTranslate = campaignDto.autoTranslate;
    message.confirmationText = campaignDto.confirmationText;
    message.optOutMessage = campaignDto.optOutMessage;
    message.simpleCampaign = savedCampaign;

    if (campaignDto.url) {
      const shortUrl = await this.shortUrlService.shortenUrl(campaignDto.url);
      message.shortenedUrls = [shortUrl];
    }

    await this.campaignMessageRepository.save(message);

    return savedCampaign;
  }
}
