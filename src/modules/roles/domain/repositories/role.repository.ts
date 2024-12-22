import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findByNameCaseInsensitive(name: string, excludeId?: number): Promise<Role | null> {
    const query = this.roleRepository.createQueryBuilder('role')
      .where('LOWER(role.name) = LOWER(:name)', { name })
      .andWhere('role.deleted_at IS NULL');

    if (excludeId) {
      query.andWhere('role.id != :id', { id: excludeId });
    }

    return query.getOne();
  }

  async findWithDeleted(id: number): Promise<Role | null> {
    return this.repository.findOne({
      where: { id } as any,
      withDeleted: true
    });
  }

  async restore(id: number): Promise<Role | null> {
    await this.repository.restore(id);
    return this.findById(id);
  }
}