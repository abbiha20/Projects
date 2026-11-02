import { Test, TestingModule } from '@nestjs/testing';
import { AutomatedCampaignService } from './automated-campaign.service';

describe('AutomatedCampaignService', () => {
  let service: AutomatedCampaignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AutomatedCampaignService],
    }).compile();

    service = module.get<AutomatedCampaignService>(AutomatedCampaignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
