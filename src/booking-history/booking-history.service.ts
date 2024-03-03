import { Injectable } from '@nestjs/common';
import { CreateBookingHistoryDto } from './dto/create-booking-history.dto';
import { UpdateBookingHistoryDto } from './dto/update-booking-history.dto';

@Injectable()
export class BookingHistoryService {
  create(createBookingHistoryDto: CreateBookingHistoryDto) {
    return 'This action adds a new bookingHistory';
  }

  findAll() {
    return `This action returns all bookingHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bookingHistory`;
  }

  update(id: number, updateBookingHistoryDto: UpdateBookingHistoryDto) {
    return `This action updates a #${id} bookingHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} bookingHistory`;
  }
}
