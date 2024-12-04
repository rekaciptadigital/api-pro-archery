import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { Role } from '../entities/role.entity';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {
    super(roleRepository);
  }

  async findAndCount(options?: FindManyOptions<Role>): Promise<[Role[], number]> {
    return this.roleRepository.findAndCount(options);
  }
}