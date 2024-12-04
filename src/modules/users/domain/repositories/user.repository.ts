import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
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
    return this.userRepository.findOne({
      where: { email } as FindOptionsWhere<User>,
    });
  }

  async findByNip(nip: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { nip } as FindOptionsWhere<User>,
    });
  }

  async findByNik(nik: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { nik } as FindOptionsWhere<User>,
    });
  }

  async findAndCount(options?: FindManyOptions<User>): Promise<[User[], number]> {
    return this.userRepository.findAndCount(options);
  }
}