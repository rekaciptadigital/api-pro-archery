import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { UserRepository } from './domain/repositories/user.repository';
import { UserService } from './application/services/user.service';
import { UserController } from './presentation/controllers/user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UserRepository, UserService],
  controllers: [UserController],
  exports: [UserRepository],
})
export class UsersModule {}