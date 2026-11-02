import { Test, TestingModule } from '@nestjs/testing';
import { SimpleCampaignService } from './simple-campaign.service';

describe('SimpleCampaignService', () => {
  let service: SimpleCampaignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SimpleCampaignService],
    }).compile();

    service = module.get<SimpleCampaignService>(SimpleCampaignService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
