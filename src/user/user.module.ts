// user.module.ts
import { Module } from '@nestjs/common';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { CustomLogger } from '../share/logger';
@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, UserRepository, CustomLogger],
})
export class UserModule {}
