import { Test, TestingModule } from '@nestjs/testing';
import { BookingHistoryService } from './booking-history.service';

describe('BookingHistoryService', () => {
  let service: BookingHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingHistoryService],
    }).compile();

    service = module.get<BookingHistoryService>(BookingHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
