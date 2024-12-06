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

  async findByNameCaseInsensitive(name: string, excludeDeleted: boolean = true): Promise<Role | null> {
    return this.roleRepository.findOne({
      where: {
        name: ILike(`${name}`),
        ...(excludeDeleted && { deleted_at: IsNull() }),
      },
    });
  }
}