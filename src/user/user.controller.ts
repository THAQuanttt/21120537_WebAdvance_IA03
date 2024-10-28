import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/get-user.dto';
import { CustomLogger } from '../share/logger';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: CustomLogger,
  ) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async signUp(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userService.signUp(createUserDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully',
        data: { user: user },
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginUserDto: LoginUserDto) {
    try {
      const user = await this.userService.login({
        email: loginUserDto.email,
        password: loginUserDto.password,
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'User fetched successfully',
        data: { user: user },
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new HttpException(error.message, error.status);
    }
  }
}
