import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, ILike, IsNull } from 'typeorm';
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

  async findByNameCaseInsensitive(name: string, excludeId?: number): Promise<Role | null> {
    const query = this.roleRepository.createQueryBuilder('role')
      .where('LOWER(role.name) = LOWER(:name)', { name })
      .andWhere('role.deleted_at IS NULL');

    if (excludeId) {
      query.andWhere('role.id != :id', { id: excludeId });
    }

    return query.getOne();
  }
}