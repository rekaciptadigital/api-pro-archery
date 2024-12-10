import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { UserSession } from '../entities/user-session.entity';
import { BaseRepository } from '../../../../common/repositories/base.repository';

@Injectable()
export class UserSessionRepository extends BaseRepository<UserSession, string> {
  constructor(
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>
  ) {
    super(userSessionRepository);
  }

  async findByToken(token: string): Promise<UserSession | null> {
    return this.userSessionRepository.findOne({
      where: { token } as FindOptionsWhere<UserSession>,
      relations: ['user']
    });
  }

  async deleteUserSessions(userId: number): Promise<void> {
    await this.userSessionRepository.softDelete({
      user_id: userId
    } as FindOptionsWhere<UserSession>);
  }

  async updateLastActivity(id: string): Promise<void> {
    await this.userSessionRepository.update(id as any, {
      last_activity: new Date()
    });
  }
}