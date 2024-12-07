import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/entities/user.entity';
import { UserRepository } from './domain/repositories/user.repository';
import { UserService } from './application/services/user.service';
import { UserController } from './presentation/controllers/user.controller';
import { UserValidator } from './domain/validators/user.validator';
import { TransformersModule } from '../../common/transformers/transformers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TransformersModule
  ],
  providers: [
    UserRepository,
    UserService,
    UserValidator
  ],
  controllers: [UserController],
  exports: [UserRepository],
})
export class UsersModule {}