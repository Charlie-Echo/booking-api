import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { UsersModule } from '../users/users.module';

import { Ticket } from '../tickets/entities/ticket.entity';
import { Location } from '../locations/entities/location.entity';
import { LocationSeat } from '../location-seats/entities/location-seat.entity';
import { BookingHistory } from '../booking-history/entities/booking-history.entity';

import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      Ticket,
      Location,
      LocationSeat,
      BookingHistory
    ]),
    UsersModule,
    CacheModule.register()
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
