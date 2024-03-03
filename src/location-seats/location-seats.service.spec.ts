import { Test, TestingModule } from '@nestjs/testing';
import { LocationSeatsService } from './location-seats.service';

describe('LocationSeatsService', () => {
  let service: LocationSeatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocationSeatsService],
    }).compile();

    service = module.get<LocationSeatsService>(LocationSeatsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
