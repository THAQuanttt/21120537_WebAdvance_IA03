// user.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async findUserByEmail({ email }: { email: string }): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
