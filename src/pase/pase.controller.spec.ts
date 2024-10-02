import { Test, TestingModule } from '@nestjs/testing';
import { PaseController } from './pase.controller';
import { PaseService } from './pase.service';

describe('PaseController', () => {
  let controller: PaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaseController],
      providers: [PaseService],
    }).compile();

    controller = module.get<PaseController>(PaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
