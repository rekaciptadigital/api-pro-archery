import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, IsNull } from 'typeorm';
import { User } from '../entities/user.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { 
        email,
        deleted_at: IsNull()
      } as FindOptionsWhere<User>,
    });
  }

  async findByNip(nip: string): Promise<User | null> {
    return this.repository.findOne({
      where: { 
        nip,
        deleted_at: IsNull()
      } as FindOptionsWhere<User>,
    });
  }

  async findByNik(nik: string): Promise<User | null> {
    return this.repository.findOne({
      where: { 
        nik,
        deleted_at: IsNull()
      } as FindOptionsWhere<User>,
    });
  }

  async findWithDeleted(id: number): Promise<User | null> {
    return this.repository.findOne({
      where: { id } as any,
      withDeleted: true
    });
  }

  async restore(id: number): Promise<User | null> {
    await this.repository.restore(id);
    return this.findById(id);
  }
}