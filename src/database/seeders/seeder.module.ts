import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseSeeder } from './database.seeder';
import { RoleSeeder } from './role.seeder';
import { UserSeeder } from './user.seeder';
import { FeatureSeeder } from './feature.seeder';
import { PermissionSeeder } from './permission.seeder';
import { Role } from '../../modules/roles/domain/entities/role.entity';
import { User } from '../../modules/users/domain/entities/user.entity';
import { UserRole } from '../../modules/user-roles/domain/entities/user-role.entity';
import { Feature } from '../../modules/features/domain/entities/feature.entity';
import { RoleFeaturePermission } from '../../modules/permissions/domain/entities/role-feature-permission.entity';
import { PasswordService } from '../../modules/auth/application/services/password.service';
import configuration from '../../config/configuration';
import { validate } from '../../config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.user'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        entities: [Role, User, UserRole, Feature, RoleFeaturePermission],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Role, User, UserRole, Feature, RoleFeaturePermission])
  ],
  providers: [
    DatabaseSeeder,
    RoleSeeder,
    UserSeeder,
    FeatureSeeder,
    PermissionSeeder,
    PasswordService
  ],
  exports: [DatabaseSeeder]
})
export class SeederModule {}