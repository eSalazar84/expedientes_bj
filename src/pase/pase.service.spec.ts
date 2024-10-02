import { Test, TestingModule } from '@nestjs/testing';
import { PaseService } from './pase.service';

describe('PaseService', () => {
  let service: PaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaseService],
    }).compile();

    service = module.get<PaseService>(PaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
