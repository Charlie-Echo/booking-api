import { Module } from '@nestjs/common';
import { LocationSeatsService } from './location-seats.service';
import { LocationSeatsController } from './location-seats.controller';

@Module({
  controllers: [LocationSeatsController],
  providers: [LocationSeatsService],
})
export class LocationSeatsModule {}
