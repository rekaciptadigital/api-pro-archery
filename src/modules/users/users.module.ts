import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { UserRepository } from './domain/repositories/user.repository';
import { UserService } from './application/services/user.service';
import { UserController } from './presentation/controllers/user.controller';
import { UserRolesModule } from '../user-roles/user-roles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    UserRolesModule,
  ],
  providers: [UserRepository, UserService],
  controllers: [UserController],
  exports: [UserRepository],
})
export class UsersModule {}