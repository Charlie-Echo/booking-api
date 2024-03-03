import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationSeatDto } from './create-location-seat.dto';

export class UpdateLocationSeatDto extends PartialType(CreateLocationSeatDto) {}
