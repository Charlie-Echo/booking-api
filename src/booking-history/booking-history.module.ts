import { Module } from '@nestjs/common';
import { BookingHistoryService } from './booking-history.service';
import { BookingHistoryController } from './booking-history.controller';

@Module({
  controllers: [BookingHistoryController],
  providers: [BookingHistoryService],
})
export class BookingHistoryModule {}
