import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  HttpException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
  ) {}

  async signUp(createUserDto: CreateUserDto) {
    try {
      const user = await this.userRepository.findUserByEmail({
        email: createUserDto.email,
      });
      if (user) {
        throw new ConflictException('User already exists');
      }
      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        this.configService.get('BCRYPT_SALT'),
      );
      const newUser = await this.userRepository.createUser({
        email: createUserDto.email,
        password: hashedPassword,
      });
      delete newUser.password;
      return newUser;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async login({ email, password }: { email: string; password: string }) {
    try {
      const user = await this.userRepository.findUserByEmail({ email });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }
      delete user.password;
      return user;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
