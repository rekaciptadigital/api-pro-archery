import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './domain/entities/role.entity';
import { RoleRepository } from './domain/repositories/role.repository';
import { RoleService } from './application/services/role.service';
import { RoleController } from './presentation/controllers/role.controller';
import { RoleValidator } from './domain/validators/role.validator';
import { PaginationModule } from '../../common/pagination/pagination.module';
import { TransformersModule } from '../../common/transformers/transformers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    PaginationModule,
    TransformersModule
  ],
  providers: [
    RoleRepository, 
    RoleService,
    RoleValidator
  ],
  controllers: [RoleController],
  exports: [RoleRepository],
})
export class RolesModule {}