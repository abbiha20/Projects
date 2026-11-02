import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AutomatedCampaign } from '../../../entities/automated-message.entity';
import { CampaignMessage } from '../../../entities/campaign-message.entity';
import { ShortUrlService } from '../../shared/services/short-url/short-url.service';
import { AutomatedCampaignDto } from '../dto/automated-campaign.dto/automated-campaign.dto';

@Injectable()
export class AutomatedCampaignService {
  constructor(
    @InjectRepository(AutomatedCampaign)
    private automatedCampaignRepository: Repository<AutomatedCampaign>,
    @InjectRepository(CampaignMessage)
    private campaignMessageRepository: Repository<CampaignMessage>,
    private shortUrlService: ShortUrlService,
  ) {}

  async createCampaign(
    campaignDto: AutomatedCampaignDto,
    userId: string,
    phoneNumbers: string[],
  ): Promise<AutomatedCampaign> {
    const campaign = new AutomatedCampaign();
    campaign.name = campaignDto.name;
    campaign.createdBy = { id: userId } as any;
    campaign.triggerEvent = campaignDto.triggerEvent;
    campaign.triggerConditions = campaignDto.triggerConditions;
    campaign.phoneNumbers = phoneNumbers;
    campaign.assignTo = campaignDto.assignTo;

    const savedCampaign = await this.automatedCampaignRepository.save(campaign);

    const message = new CampaignMessage();
    message.message = campaignDto.message;
    message.autoTranslate = campaignDto.autoTranslate;
    message.confirmationText = campaignDto.confirmationText;
    message.optOutMessage = campaignDto.optOutMessage;
    message.automatedCampaign = savedCampaign;

    if (campaignDto.url) {
      const shortUrl = await this.shortUrlService.shortenUrl(campaignDto.url);
      message.shortenedUrls = [shortUrl];
    }

    await this.campaignMessageRepository.save(message);

    return savedCampaign;
  }

  async getCampaignsByEvent(event: string): Promise<AutomatedCampaign[]> {
    return this.automatedCampaignRepository.find({
      where: { triggerEvent: event },
      relations: ['messages'],
    });
  }
}
