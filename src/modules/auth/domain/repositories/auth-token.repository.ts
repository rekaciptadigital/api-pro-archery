import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, IsNull } from 'typeorm';
import { AuthToken } from '../entities/auth-token.entity';
import { BaseRepository } from '../../../../common/repositories/base.repository';

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
        deleted_at: IsNull()
      } as FindOptionsWhere<AuthToken>
    });
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.authTokenRepository.softDelete({
      expires_at: new Date()
    } as FindOptionsWhere<AuthToken>);
  }

  async deleteUserTokens(userId: number): Promise<void> {
    await this.authTokenRepository.softDelete({
      user_id: userId
    } as FindOptionsWhere<AuthToken>);
  }
}