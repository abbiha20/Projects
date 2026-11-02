import { Test, TestingModule } from '@nestjs/testing';
import { AutomatedCampaignController } from './automated-campaign.controller';

describe('AutomatedCampaignController', () => {
  let controller: AutomatedCampaignController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutomatedCampaignController],
    }).compile();

    controller = module.get<AutomatedCampaignController>(AutomatedCampaignController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
