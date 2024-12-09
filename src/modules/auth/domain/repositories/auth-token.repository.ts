import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { AuthToken } from '../entities/auth-token.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class AuthTokenRepository extends BaseRepository<AuthToken> {
  constructor(
    @InjectRepository(AuthToken)
    private readonly authTokenRepository: Repository<AuthToken>
  ) {
    super(authTokenRepository);
  }

  async findByRefreshToken(refreshToken: string): Promise<AuthToken | null> {
    return this.authTokenRepository.findOne({
      where: { 
        refresh_token: refreshToken,
        expires_at: LessThan(new Date())
      },
      relations: ['user']
    });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.authTokenRepository.softDelete({
      expires_at: LessThan(new Date())
    });
  }

  async deleteUserTokens(userId: number): Promise<void> {
    await this.authTokenRepository.softDelete({
      user_id: userId
    });
  }
}