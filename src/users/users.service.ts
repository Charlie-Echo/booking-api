import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { Users } from './entities/user.entity';
import { hashSync, genSaltSync } from 'bcryptjs';
import { sign as JWTSign, verify as JWTVerify } from 'jsonwebtoken';

type tokenPayload = { email: string, userID: number, role: number };

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private readonly userRepository: Repository<Users>,
  ) {}

  async verifyLogin(params) {
    const userData = await this.userRepository.findBy({ email: params.email });
    if (!userData || !userData[0]) {
      return { error: 'User not found' };
    }

    if (this.hashPassword(params.password, userData[0].salt) !== userData[0].password) {
      return { error: 'Invalid credential' };
    }

    return { email: userData[0].email, userID: userData[0].id, token: this.generateToken({
      email: userData[0].email,
      userID: userData[0].id,
      role: userData[0].role
    }) };
  }

  async createUser(params: CreateUserDto) {
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(params.email)) {
      throw new HttpException('Invalid email address format', HttpStatus.BAD_REQUEST);
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}/.test(params.password)) {
      throw new HttpException('Invalid password format', HttpStatus.BAD_REQUEST);
    }

    const salt = this.generateSalt();
    const user: Users = new Users();
    user.email = params.email;
    user.password = this.hashPassword(params.password, salt);
    user.salt = salt;
    user.role = params.secret && params.secret === process.env.STAFF_SECRET ? 1 : 2;

    try {
      await this.userRepository.save(user);
    } catch (error) {
      console.error(error);
      const isDuplicated = error.message.indexOf('duplicate key value violates') !== -1;
      throw new HttpException(isDuplicated ? 'This email is already registered' : 'Internal server error',
        isDuplicated ? HttpStatus.BAD_REQUEST : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  hashPassword(plainText: string, salt: string): string {
    return hashSync(plainText, salt);
  }

  generateSalt(): string {
    return genSaltSync(5);
  }

  generateToken(userData: tokenPayload) {
    return JWTSign(userData, process.env.JWT_KEY, { expiresIn: 3600 });
  }

  verifyToken(token: string) {
    let verifyResult: tokenPayload;
    let result : { email?: string, userID?: number, role?: number, error?: string };
    try {
      verifyResult = JWTVerify(token, process.env.JWT_KEY) as tokenPayload;
      result = { email: verifyResult.email, userID: verifyResult.userID, role: verifyResult.role };
    } catch (error) {
      result = { error: 'Invalid or expired token' };
    }

    return result;
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
