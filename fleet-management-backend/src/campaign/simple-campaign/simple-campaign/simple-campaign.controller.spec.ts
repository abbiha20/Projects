import { Test, TestingModule } from '@nestjs/testing';
import { SimpleCampaignController } from './simple-campaign.controller';

describe('SimpleCampaignController', () => {
  let controller: SimpleCampaignController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SimpleCampaignController],
    }).compile();

    controller = module.get<SimpleCampaignController>(SimpleCampaignController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
