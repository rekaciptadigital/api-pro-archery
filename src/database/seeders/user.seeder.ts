import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../modules/users/domain/entities/user.entity';
import { Role } from '../../modules/roles/domain/entities/role.entity';
import { UserRole } from '../../modules/user-roles/domain/entities/user-role.entity';
import { PasswordService } from '../../modules/auth/application/services/password.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class UserSeeder {
  private readonly logger = new Logger(UserSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private readonly passwordService: PasswordService
  ) {}

  async createMany(): Promise<void> {
    try {
      // Find super_admin role
      const superAdminRole = await this.roleRepository.findOne({
        where: { name: 'super_admin' }
      });

      if (!superAdminRole) {
        throw new Error('Super admin role not found');
      }

      // Create super admin user
      const hashedPassword = await this.passwordService.hashPassword('Testing123@jt');
      
      const superAdmin = {
        first_name: 'super',
        last_name: 'admin',
        email: 'super_admin@gmail.com',
        password: hashedPassword,
        status: true
      };

      // Check if super admin exists
      const existingUser = await this.userRepository.findOne({
        where: { email: superAdmin.email }
      });

      if (!existingUser) {
        // Create user
        const createdUser = await this.userRepository.save(superAdmin);
        this.logger.log(`Created user: ${createdUser.email}`);

        // Assign role
        await this.userRoleRepository.save({
          user_id: createdUser.id,
          role_id: superAdminRole.id,
          status: true
        });
        this.logger.log(`Assigned role to user: ${createdUser.email}`);
      } else {
        this.logger.log(`User already exists: ${superAdmin.email}`);
      }
    } catch (error) {
      this.logger.error('Error seeding users:', error);
      throw error;
    }
  }
}