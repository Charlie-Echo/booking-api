import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingHistoryDto } from './create-booking-history.dto';

export class UpdateBookingHistoryDto extends PartialType(CreateBookingHistoryDto) {}
