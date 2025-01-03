import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { UserRepository } from './domain/repositories/user.repository';
import { UserService } from './application/services/user.service';
import { UserController } from './presentation/controllers/user.controller';
import { UserValidator } from './domain/validators/user.validator';
import { TransformersModule } from '@/common/transformers/transformers.module';
import { RoleFeaturePermission } from '@/modules/permissions/domain/entities/role-feature-permission.entity';
import { PasswordService } from '../auth/application/services/password.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RoleFeaturePermission]),
    TransformersModule
  ],
  providers: [
    UserRepository,
    UserService,
    UserValidator,
    PasswordService
  ],
  controllers: [UserController],
  exports: [UserRepository],
})
export class UsersModule {}