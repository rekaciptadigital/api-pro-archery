import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './domain/entities/role.entity';
import { RoleRepository } from './domain/repositories/role.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleRepository],
  exports: [RoleRepository],
})
export class RolesModule {}