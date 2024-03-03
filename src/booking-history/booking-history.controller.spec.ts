import { Test, TestingModule } from '@nestjs/testing';
import { BookingHistoryController } from './booking-history.controller';
import { BookingHistoryService } from './booking-history.service';

describe('BookingHistoryController', () => {
  let controller: BookingHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingHistoryController],
      providers: [BookingHistoryService],
    }).compile();

    controller = module.get<BookingHistoryController>(BookingHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
