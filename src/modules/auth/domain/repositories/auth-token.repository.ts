import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull, FindOptionsWhere } from 'typeorm';
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
    const where: FindOptionsWhere<AuthToken> = {
      refresh_token: refreshToken,
      deleted_at: IsNull()
    };

    return this.authTokenRepository.findOne({
      where
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