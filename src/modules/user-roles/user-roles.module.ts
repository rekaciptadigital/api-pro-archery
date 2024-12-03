import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserRole } from "./domain/entities/user-role.entity";
import { UserRoleRepository } from "./domain/repositories/user-role.repository";
import { UserRoleService } from "./application/services/user-role.service";
import { UserRoleController } from "./presentation/controllers/user-role.controller";
import { UsersModule } from "../users/users.module";
import { RolesModule } from "../roles/roles.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRole]),
    UsersModule,
    RolesModule,
  ],
  providers: [UserRoleRepository, UserRoleService],
  controllers: [UserRoleController],
  exports: [UserRoleRepository],
})
export class UserRolesModule {}