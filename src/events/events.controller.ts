import { Headers, Controller, Get, Post, Body, Put, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { EventsService } from './events.service';
import { UsersService } from '../users/users.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly usersService: UsersService
  ) {}

  @Get()
  async showAllEvents() {
    const result = await this.eventsService.findAll();
    return this.eventsService.wrapResponse(200, 'OK', result);
  }

  @Post()
  async createEvent(@Headers() headers, @Body() createEventDto: CreateEventDto) {
    const userCredential = this.usersService.verifyToken(headers.authorization);
    if (userCredential.error) {
      throw new HttpException(userCredential.error, HttpStatus.BAD_REQUEST);
    } else if (userCredential.role !== 1) {
      throw new HttpException('Invalid role for creating an event', HttpStatus.BAD_REQUEST);
    }

    const result = await this.eventsService.createEvent({ ...createEventDto, organizer: userCredential.userID });
    return this.eventsService.wrapResponse(201, 'Created', result);
  }

  @Get(':id')
  async showEventByID(@Param('id') id: number) {
    const result = await this.eventsService.findOne(id);
    return this.eventsService.wrapResponse(200, 'OK', result);
  }

  @Post(':id')
  async bookEventTicket(@Headers() headers, @Param('id') id: string, @Body() body) {
    const userCredential = this.usersService.verifyToken(headers.authorization);
    if (userCredential.error) {
      throw new HttpException(userCredential.error, HttpStatus.BAD_REQUEST);
    } else if (userCredential.role !== 2) {
      throw new HttpException('Invalid role for booking an event', HttpStatus.BAD_REQUEST);
    }

    const result = await this.eventsService.bookEventTicket({
      userID: userCredential.userID, eventID: parseInt(id), ...body
    });

    return this.eventsService.wrapResponse(200, 'OK', result);
  }

  @Put(':id')
  async updateEventByID(@Headers() headers, @Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    const userCredential = this.usersService.verifyToken(headers.authorization);
    if (userCredential.error) {
      throw new HttpException(userCredential.error, HttpStatus.BAD_REQUEST);
    } else if (userCredential.role !== 1) {
      throw new HttpException('Invalid role for creating an event', HttpStatus.BAD_REQUEST);
    }

    const result = await this.eventsService.updateEvent(parseInt(id), updateEventDto, userCredential.userID);
    return this.eventsService.wrapResponse(200, 'OK', result);
  }

  @Delete(':id')
  async deleteEventByID(@Headers() headers, @Param('id') id: string) {
    const userCredential = this.usersService.verifyToken(headers.authorization);
    if (userCredential.error) {
      throw new HttpException(userCredential.error, HttpStatus.BAD_REQUEST);
    } else if (userCredential.role !== 1) {
      throw new HttpException('Invalid role for creating an event', HttpStatus.BAD_REQUEST);
    }

    const result = await this.eventsService.deleteEvent(parseInt(id), userCredential.userID);
    return this.eventsService.wrapResponse(200, 'OK', result);
  }
}
