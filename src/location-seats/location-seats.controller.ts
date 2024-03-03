import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LocationSeatsService } from './location-seats.service';
import { CreateLocationSeatDto } from './dto/create-location-seat.dto';
import { UpdateLocationSeatDto } from './dto/update-location-seat.dto';

@Controller('location-seats')
export class LocationSeatsController {
  constructor(private readonly locationSeatsService: LocationSeatsService) {}

  @Post()
  create(@Body() createLocationSeatDto: CreateLocationSeatDto) {
    return this.locationSeatsService.create(createLocationSeatDto);
  }

  @Get()
  findAll() {
    return this.locationSeatsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.locationSeatsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLocationSeatDto: UpdateLocationSeatDto) {
    return this.locationSeatsService.update(+id, updateLocationSeatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.locationSeatsService.remove(+id);
  }
}
