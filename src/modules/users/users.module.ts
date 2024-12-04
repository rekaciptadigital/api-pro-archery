import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { Role } from '../roles/domain/entities/role.entity';
import { UserRole } from '../user-roles/domain/entities/user-role.entity';
import { UserRepository } from './domain/repositories/user.repository';
import { UserService } from './application/services/user.service';
import { UserController } from './presentation/controllers/user.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, UserRole])
  ],
  providers: [UserRepository, UserService],
  controllers: [UserController],
  exports: [UserRepository],
})
export class UsersModule {}