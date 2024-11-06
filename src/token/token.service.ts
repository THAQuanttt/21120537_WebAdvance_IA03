import { Injectable } from '@nestjs/common';

import { TokenRepository } from './token.repository';

@Injectable()
export class TokenService {
  constructor(private readonly tokenRepository: TokenRepository) {}

  async createToken({ token, userId }: { token: string; userId: string }) {
    const createdToken = await this.tokenRepository.createToken({
      user: { connect: { id: userId } },
      token,
    });
    return createdToken;
  }
  async deleteToken(userId: string) {
    const deletedToken = await this.tokenRepository.deleteToken({ userId });
    return deletedToken;
  }

  async findTokenByUserId(userId: string) {
    const token = await this.tokenRepository.findTokenByUserId({ userId });
    return token;
  }
}
