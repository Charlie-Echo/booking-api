import { Test, TestingModule } from '@nestjs/testing';
import { LocationSeatsController } from './location-seats.controller';
import { LocationSeatsService } from './location-seats.service';

describe('LocationSeatsController', () => {
  let controller: LocationSeatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationSeatsController],
      providers: [LocationSeatsService],
    }).compile();

    controller = module.get<LocationSeatsController>(LocationSeatsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
