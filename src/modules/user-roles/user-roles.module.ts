import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserRole } from "./domain/entities/user-role.entity";
import { UserRoleRepository } from "./domain/repositories/user-role.repository";
import { UserRoleService } from "./application/services/user-role.service";
import { UserRoleController } from "./presentation/controllers/user-role.controller";
import { UserRoleValidator } from "./domain/validators/user-role.validator";
import { UsersModule } from "../users/users.module";
import { RolesModule } from "../roles/roles.module";
import { TransformersModule } from "../../common/transformers/transformers.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRole]),
    UsersModule,
    RolesModule,
    TransformersModule
  ],
  providers: [
    UserRoleRepository,
    UserRoleService,
    UserRoleValidator
  ],
  controllers: [UserRoleController],
  exports: [UserRoleRepository],
})
export class UserRolesModule {}