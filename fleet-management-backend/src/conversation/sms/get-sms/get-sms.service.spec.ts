import { Test, TestingModule } from '@nestjs/testing';
import { GetSmsService } from './get-sms.service';

describe('GetSmsService', () => {
  let service: GetSmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetSmsService],
    }).compile();

    service = module.get<GetSmsService>(GetSmsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
