import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { LocationsModule } from './locations/locations.module';
import { RolesModule } from './roles/roles.module';
import { BookingHistoryModule } from './booking-history/booking-history.module';
import { TicketsModule } from './tickets/tickets.module';
import { LocationSeatsModule } from './location-seats/location-seats.module';

import { Users } from './users/entities/user.entity';
import { Event } from './events/entities/event.entity';
import { Location } from './locations/entities/location.entity';
import { Role } from './roles/entities/role.entity';
import { BookingHistory } from './booking-history/entities/booking-history.entity';
import { Ticket } from './tickets/entities/ticket.entity';
import { LocationSeat } from './location-seats/entities/location-seat.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['environment.env']
    }),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT)
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      entities: [Users, Event, Location, Role, BookingHistory, Ticket, LocationSeat],
      database: process.env.DB_NAME,
      synchronize: process.env.DB_SYNC === 'true',
      logging: process.env.DB_LOGGING === 'true',
    }),
    UsersModule,
    EventsModule,
    LocationsModule,
    RolesModule,
    BookingHistoryModule,
    TicketsModule,
    LocationSeatsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
