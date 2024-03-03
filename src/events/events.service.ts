import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

import { Event } from './entities/event.entity';
import { Ticket } from '../tickets/entities/ticket.entity';
import { Location } from '../locations/entities/location.entity';
import { LocationSeat } from '../location-seats/entities/location-seat.entity';
import { BookingHistory } from '../booking-history/entities/booking-history.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private readonly eventRepository: Repository<Event>,
    @InjectRepository(Ticket) private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Location) private readonly locationRepository: Repository<Location>,
    @InjectRepository(LocationSeat) private readonly locationSeatRepository: Repository<LocationSeat>,
    @InjectRepository(BookingHistory) private readonly bookingHistoryRepository: Repository<BookingHistory>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async findAll() {
    let result;
    try {
      result = await this.cacheManager.get('C64B4Cfa/Events');
      if (result) {
        return result;
      }

      result = await this.eventRepository.find();
      if (result.length > 0) {
        await this.cacheManager.set('C64B4Cfa/Events', result, 60000);
      } else {
        result = [];
      }
    } catch (error) {
      console.error(error);
      throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // const params = [];
    // let currentSeatNumber;
    // const zone = 'VIP';
    // for (let index = 1; index <= 10; index++) {
    //   if (index < 10) {
    //     currentSeatNumber = zone + '0' + index.toString();
    //   } else {
    //     currentSeatNumber = zone + index.toString();
    //   }
    //   params.push({
    //     seat: currentSeatNumber,
    //     location_id: 2,
    //     zone: zone,
    //     row: Math.ceil(index / 10)
    //   });
    // }

    // console.log('---------------------------------');
    // console.log(params);
    // console.log('---------------------------------');

    // await this.locationSeatRepository.save(params);

    return result;
  }

  async findOne(id: number) {
    let result;
    result = await this.cacheManager.get(`C64B4Cfa/Event/${id}`);
    try {
      if (result) {
        return result;
      }

      result = await this.eventRepository.findBy({ id: id });
      if (result[0]) {
        result = result[0];
        await this.cacheManager.set(`C64B4Cfa/Event/${id}`, result, 60000);
        const seats = await this.ticketRepository.find({
          where: { event_id: id }
        });

        result.seats = seats;
      } else {
        result = {};
      }
    } catch (error) {
      console.error(error);
      throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return result;
  }

  async createEvent(createEventDto: CreateEventDto & { organizer: number }) {
    let params = {
      name: createEventDto.name,
      description: createEventDto.description,
      organizer: createEventDto.organizer,
      location: createEventDto.location,
      start_date: new Date(createEventDto.start),
      end_date: new Date(createEventDto.end)
    };

    try {
      await this.checkDatetimeConflict({ start: params.start_date, end: params.end_date });
      const location = await this.locationRepository.findBy({ id: createEventDto.location });
      if (location.length <= 0 || !location[0]) {
        throw new HttpException('Location not found', HttpStatus.BAD_REQUEST);
      }

      if (createEventDto.seats && (
        !Array.isArray(createEventDto.seats) || 
        (Array.isArray(createEventDto.seats) && createEventDto.seats.length <= 0)
      )) {
        throw new HttpException('Seats for the event cannot be empty', HttpStatus.BAD_REQUEST);
      }
  
      const locationSeats = await this.locationSeatRepository.findBy({ location_id: createEventDto.location });
      if (createEventDto.seats) {
        const seats = locationSeats.map(eachSeat =>  eachSeat.seat);
        for (let index = 0; index < createEventDto.seats.length; index++) {
          if (seats.indexOf(createEventDto.seats[index]) === -1) {
            throw new HttpException(`Seat ${createEventDto.seats[index]} not found`, HttpStatus.BAD_REQUEST);
          }
        }
      }

      const createEventResult = await this.eventRepository.save(params);
      const tickets = await this.prepareSeatParams({
        eventID: createEventResult.id,
        locationID: params.location,
        inputSeats: createEventDto.seats,
        locationSeats: locationSeats
      });

      await this.eventRepository.save(params);
      await this.ticketRepository.save(tickets);
      await this.cacheManager.del('C64B4Cfa/Events');
    } catch (error) {
      console.error(error);
      throw new HttpException(error.response ? error.response :'Something went wrong',
        error.status ? error.status : HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return params;
  }

  async updateEvent(id: number, updateEventDto: UpdateEventDto, userID: number) {
    let params = {
      id: id,
      name: updateEventDto.name ? updateEventDto.name : undefined,
      description: updateEventDto.description ? updateEventDto.description : undefined,
      location: updateEventDto.location ? updateEventDto.location : undefined,
      start_date: updateEventDto.start ? new Date(updateEventDto.start) : undefined,
      end_date: updateEventDto.end ? new Date(updateEventDto.end) : undefined,
    };

    try {
      const currentData = await this.findOne(id);
      if (!currentData.id) {
        throw new HttpException('Data not found', HttpStatus.BAD_REQUEST);
      } else if (currentData.organizer !== userID) {
        throw new HttpException('Credential not match', HttpStatus.FORBIDDEN);
      }

      if (params.start_date || params.end_date) {
        await this.checkDatetimeConflict({
          start: params.start_date ? params.start_date : currentData.start_date,
          end: params.end_date ? params.end_date : currentData.end_date 
        });
      }

      if ((params.location && params.location !== currentData.location) || updateEventDto.seats) {
        const soldTickets = await this.ticketRepository.find({
          where: { event_id: id, is_booked: true }
        });

        if (soldTickets.length > 0) {
          throw new HttpException('Cannot change location when the tickets are sold', HttpStatus.UNAUTHORIZED);
        }

        const tickets = await this.prepareSeatParams({
          eventID: id,
          locationID: currentData.location,
          inputSeats: updateEventDto.seats,
          validate: true
        });

        await this.ticketRepository.delete({ event_id: id });
        await this.ticketRepository.save(tickets);
      }

      await this.eventRepository.update(id, params);
      await this.cacheManager.del('C64B4Cfa/Events');
      await this.cacheManager.del(`C64B4Cfa/Event/${id}`);
    } catch (error) {
      console.error(error);
      throw new HttpException(error.response ? error.response :'Something went wrong',
        error.status ? error.status : HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return params;
  }

  async prepareSeatParams(params: {
    eventID: number, locationID: number, inputSeats: unknown, locationSeats?: LocationSeat[], validate?: boolean
  }) {
    let tickets = [];
    if (params.validate && (
      params.inputSeats && params.inputSeats !== 'all' && (!Array.isArray(params.inputSeats) || (
        Array.isArray(params.inputSeats) && params.inputSeats.length <= 0
      ))
    )) {
      throw new HttpException('Seats for the event cannot be empty', HttpStatus.BAD_REQUEST);
    }

    const locationSeats = params.locationSeats ? params.locationSeats : await this.locationSeatRepository.findBy({ location_id: params.locationID });
    if (Array.isArray(params.inputSeats) && params.inputSeats.length > 0) {
      const seats = locationSeats.map(eachSeat => eachSeat.seat);
      for (let index = 0; index < params.inputSeats.length; index++) {
        if (params.validate && seats.indexOf(params.inputSeats[index]) === -1) {
          throw new HttpException(`Seat ${params.inputSeats[index]} not found`, HttpStatus.BAD_REQUEST);
        }

        tickets.push({
          id: `${params.eventID}-${params.inputSeats[index]}`,
          seat: params.inputSeats[index],
          event_id: params.eventID,
          is_booked: false
        });
      }
    } else {
      locationSeats.forEach(eachSeat => {
        tickets.push({
          id: `${params.eventID}-${eachSeat.seat}`,
          seat: eachSeat.seat,
          event_id: params.eventID,
          is_booked: false
        });
      });
    }

    return tickets;
  }

  async deleteEvent(id: number, userID: number) {
    const params = { id: id };
    try {
      const currentData = await this.findOne(id);
      if (!currentData.id) {
        throw new HttpException('Data not found', HttpStatus.BAD_REQUEST);
      } else if (currentData.organizer !== userID) {
        throw new HttpException('Credential not match', HttpStatus.FORBIDDEN);
      }

      const soldTickets = await this.ticketRepository.find({
        where: { event_id: id, is_booked: true }
      });

      if (soldTickets.length > 0) {
        throw new HttpException('Cannot delete event when the tickets are sold', HttpStatus.UNAUTHORIZED);
      }
  
      await this.eventRepository.delete(params);
      await this.ticketRepository.delete({ event_id: id });
      await this.cacheManager.del('C64B4Cfa/Events');
      await this.cacheManager.del(`C64B4Cfa/Event/${id}`);
    } catch (error) {
      console.error(error);
      throw new HttpException(error.response ? error.response :'Something went wrong',
        error.status ? error.status : HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return params;
  }

  async checkDatetimeConflict(date: { start: Date, end: Date }) {
    try {
      if (date.start >= date.end) {
        throw new HttpException('Start date cannot be more or equal the end date', HttpStatus.BAD_REQUEST);
      }

      const result = await this.eventRepository.find({
        where: {
          start_date: MoreThanOrEqual(date.start),
          end_date: LessThanOrEqual(date.end)
        }
      });

      if (result.length > 0) {
        throw new HttpException('Date and time overlap', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.error(error);
      throw new HttpException(error.response ? error.response :'Something went wrong',
        error.status ? error.status : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async bookEventTicket(params) {
    try {
      params.tickets = params.tickets.filter((value, index, array) => {
        return array.indexOf(value) === index;
      });

      let whereParams = [];
      params.tickets.forEach(ticket => {
        whereParams.push({ id: ticket, event_id: params.eventID });
      });

      const availableSeats = await this.ticketRepository.find({
        where: whereParams
      });

      if (availableSeats.length <= 0) {
        throw new HttpException(`This event has no seats`, HttpStatus.BAD_REQUEST);
      }

      let bookingParams = [];
      let bookingHistoryParams = [];
      let latestHistoryID = await this.bookingHistoryRepository.maximum('id');
      typeof latestHistoryID  === 'number' ? latestHistoryID++ : latestHistoryID = 1;

      for (let index = 0; index < availableSeats.length; index++) {
        if (availableSeats[index].is_booked) {
          throw new HttpException(`Seat ${availableSeats[index].seat} is already booked`, HttpStatus.BAD_REQUEST);
        }

        bookingParams.push({
          id: availableSeats[index].id,
          seat: availableSeats[index].seat,
          event_id: availableSeats[index].event_id,
          is_booked: true
        });

        bookingHistoryParams.push({
          id: latestHistoryID,
          ticket_id: availableSeats[index].id,
          user_id: params.userID,
          date_time: new Date()
        });
      }

      await this.ticketRepository.save(bookingParams);
      await this.bookingHistoryRepository.save(bookingHistoryParams);
      await this.cacheManager.del(`C64B4Cfa/Event/${params.eventID}`);
    } catch (error) {
      console.error(error);
      throw new HttpException(error.response ? error.response :'Something went wrong',
        error.status ? error.status : HttpStatus.INTERNAL_SERVER_ERROR);
    }
  
    return params;
  }

  wrapResponse(statusCode: number, message: string, data?: any): {
    statusCode: number, message: string, data?: any
  } {
    return {
      statusCode: statusCode,
      message: message,
      data: data ? data : undefined
    };
  }
}
