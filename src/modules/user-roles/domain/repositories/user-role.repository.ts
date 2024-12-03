import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
    return this.userRoleRepository.findOne({
      where: {
        user_id: userId,
        role_id: roleId,
      }
    });
  }

  async findByUser(userId: number): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      where: { user_id: userId },
      relations: ["user", "role"],
    });
  }

  async findAllWithRelations(): Promise<UserRole[]> {
    return this.userRoleRepository.find({
      relations: ["user", "role"],
    });
  }

  async findOneWithRelations(id: number): Promise<UserRole | null> {
    return this.userRoleRepository.findOne({
      where: { id },
      relations: ["user", "role"],
    });
  }
}