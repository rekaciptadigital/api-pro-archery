import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './domain/entities/role.entity';
import { RoleRepository } from './domain/repositories/role.repository';
import { RoleService } from './application/services/role.service';
import { RoleController } from './presentation/controllers/role.controller';
import { PaginationModule } from '../../common/pagination/pagination.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Role]),
    PaginationModule
  ],
  providers: [RoleRepository, RoleService],
  controllers: [RoleController],
  exports: [RoleRepository],
})
export class RolesModule {}