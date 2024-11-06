import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';

import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/get-user.dto';
import { CustomLogger } from '../share/logger';
import { UserGuard } from './user.guard';
import { RequestWithUser } from './interface/requestUser.interface';
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
      const { accessToken, refreshToken } =
        await this.userService.signUp(createUserDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'User created successfully',
        data: { accessToken, refreshToken },
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
      const { accessToken, refreshToken, user } = await this.userService.login({
        email: loginUserDto.email,
        password: loginUserDto.password,
      });
      return {
        statusCode: HttpStatus.OK,
        message: 'User fetched successfully',
        data: { accessToken, refreshToken, user },
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(UserGuard)
  async logout(@Req() req: RequestWithUser) {
    try {
      const { user } = req;
      await this.userService.logout(user.id);
      return {
        statusCode: HttpStatus.OK,
        message: 'User logged out successfully',
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new HttpException(error.message, error.status);
    }
  }

  @Get('/profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(UserGuard)
  async getProfile(@Req() req: RequestWithUser) {
    try {
      const { user } = req;
      const userData = await this.userService.getProfile(user.id);
      return {
        statusCode: HttpStatus.OK,
        message: 'User profile fetched successfully',
        data: { email: userData.email },
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new HttpException(error.message, error.status);
    }
  }

  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(UserGuard)
  async refreshToken(@Req() req: RequestWithUser) {
    try {
      const { user } = req;
      const { accessToken } = await this.userService.refreshToken(user);
      return {
        statusCode: HttpStatus.OK,
        message: 'Token refreshed successfully',
        data: { accessToken },
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new HttpException(error.message, error.status);
    }
  }
}
