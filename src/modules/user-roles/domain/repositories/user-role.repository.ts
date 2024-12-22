import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import { UserRole } from "../entities/user-role.entity";
import { BaseRepository } from "../../../common/repositories/base.repository";

@Injectable()
export class UserRoleRepository extends BaseRepository<UserRole> {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>
  ) {
    super(userRoleRepository);
  }

  async findByUserAndRole(userId: number, roleId: number): Promise<UserRole | null> {
    return this.repository.findOne({
      where: {
        user_id: userId,
        role_id: roleId,
        deleted_at: IsNull()
      }
    });
  }

  async findByUser(userId: number): Promise<UserRole[]> {
    return this.repository.find({
      where: { 
        user_id: userId,
        deleted_at: IsNull()
      },
      relations: ["user", "role"],
    });
  }

  async findAllWithRelations(): Promise<UserRole[]> {
    return this.repository.find({
      where: { deleted_at: IsNull() },
      relations: ["user", "role"],
    });
  }

  async findOneWithRelations(id: number): Promise<UserRole | null> {
    return this.repository.findOne({
      where: { 
        id,
        deleted_at: IsNull()
      },
      relations: ["user", "role"],
    });
  }

  async findWithDeleted(id: number): Promise<UserRole | null> {
    return this.repository.findOne({
      where: { id } as any,
      withDeleted: true
    });
  }

  async restore(id: number): Promise<UserRole | null> {
    await this.repository.restore(id);
    return this.findById(id);
  }
}