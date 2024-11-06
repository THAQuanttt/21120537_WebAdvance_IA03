// user.repository.ts
import { Injectable } from '@nestjs/common';
import { Prisma, Token } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createToken(data: Prisma.TokenCreateInput): Promise<Token> {
    return this.prisma.token.create({ data });
  }

  async findTokenByUserId({
    userId,
  }: {
    userId: string;
  }): Promise<Token | null> {
    return this.prisma.token.findFirst({ where: { userId } });
  }

  async deleteToken({
    userId,
  }: {
    userId: string;
  }): Promise<Prisma.BatchPayload> {
    return this.prisma.token.deleteMany({
      where: { userId },
    });
  }
}
