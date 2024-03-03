import { Controller, Post, Body, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() credential: CreateUserDto) {
    const result = await this.usersService.verifyLogin(credential);
    return result.error ? this.usersService.wrapResponse(HttpStatus.BAD_REQUEST, result.error) :
      this.usersService.wrapResponse(HttpStatus.OK, 'OK', result);
  }

  @Post('verifyToken')
  async verifyToken(@Body() params: { token: string }) {
    const result = this.usersService.verifyToken(params.token);
    return result.error ? this.usersService.wrapResponse(400, result.error) :
      this.usersService.wrapResponse(200, 'OK', result);
  }

  @Post('register')
  async create(@Body() params: CreateUserDto) {
    await this.usersService.createUser(params);
    return this.usersService.wrapResponse(HttpStatus.CREATED, 'Created');
  }
}
