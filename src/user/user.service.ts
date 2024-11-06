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
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../token/token.service';
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
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
      const accessToken = await this.jwtService.signAsync(
        { id: newUser.id },
        { expiresIn: '15m' },
      );
      const refreshToken = await this.jwtService.signAsync(
        { id: newUser.id },
        { expiresIn: '7d' },
      );
      await this.tokenService.createToken({
        token: refreshToken,
        userId: newUser.id,
      });
      return { accessToken, refreshToken };
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
      const accessToken = await this.jwtService.signAsync(
        { id: user.id },
        { expiresIn: '15m' },
      );
      const refreshToken = await this.jwtService.signAsync(
        { id: user.id },
        { expiresIn: '7d' },
      );
      await this.tokenService.deleteToken(user.id);
      await this.tokenService.createToken({
        token: refreshToken,
        userId: user.id,
      });
      return { user, accessToken, refreshToken };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async getProfile(id: string) {
    try {
      const user = await this.userRepository.findUserById({ id });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      delete user.password;
      return user;
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async logout(id: string) {
    try {
      await this.tokenService.deleteToken(id);
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async refreshToken(user: { id: string; token: string }) {
    try {
      const token = await this.tokenService.findTokenByUserId(user.id);
      if (!token || token.token !== user.token) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const accessToken = await this.jwtService.signAsync(
        { id: user.id },
        { expiresIn: '15m' },
      );
      return { accessToken };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }
}
