import { Injectable } from '@nestjs/common';
import { CreateLocationSeatDto } from './dto/create-location-seat.dto';
import { UpdateLocationSeatDto } from './dto/update-location-seat.dto';

@Injectable()
export class LocationSeatsService {
  create(createLocationSeatDto: CreateLocationSeatDto) {
    return 'This action adds a new locationSeat';
  }

  findAll() {
    return `This action returns all locationSeats`;
  }

  findOne(id: number) {
    return `This action returns a #${id} locationSeat`;
  }

  update(id: number, updateLocationSeatDto: UpdateLocationSeatDto) {
    return `This action updates a #${id} locationSeat`;
  }

  remove(id: number) {
    return `This action removes a #${id} locationSeat`;
  }
}
