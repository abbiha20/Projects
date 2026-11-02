import { Test, TestingModule } from '@nestjs/testing';
import { PermissionTeamController } from './permission-team.controller';

describe('PermissionTeamController', () => {
  let controller: PermissionTeamController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionTeamController],
    }).compile();

    controller = module.get<PermissionTeamController>(PermissionTeamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
