import { Test, TestingModule } from '@nestjs/testing';
import { CampaignMessageService } from './campaign-message.service';

describe('CampaignMessageService', () => {
  let service: CampaignMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CampaignMessageService],
    }).compile();

    service = module.get<CampaignMessageService>(CampaignMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
