import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../modules/users/domain/entities/user.entity";
import { Role } from "../../modules/roles/domain/entities/role.entity";
import { UserRole } from "../../modules/user-roles/domain/entities/user-role.entity";
import { PasswordService } from "../../modules/auth/application/services/password.service";
import { Logger } from "@nestjs/common";
import { Seeder } from "./seeder.interface";

@Injectable()
export class UserSeeder implements Seeder {
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
      await this.createSuperAdmin();
      await this.createDummyUsers();
    } catch (error) {
      this.logger.error("Error seeding users:", error);
      throw error;
    }
  }

  private async createSuperAdmin(): Promise<void> {
    try {
      const superAdminRole = await this.roleRepository.findOne({
        where: { name: "super_admin" },
      });

      if (!superAdminRole) {
        throw new Error("Super admin role not found");
      }

      const hashedPassword =
        await this.passwordService.hashPassword("Testing123@jt");

      const superAdmin = {
        first_name: "super",
        last_name: "admin",
        email: "super_admin@gmail.com",
        password: hashedPassword,
        status: true,
      };

      const existingUser = await this.userRepository.findOne({
        where: { email: superAdmin.email },
      });

      if (!existingUser) {
        const createdUser = await this.userRepository.save(superAdmin);
        this.logger.log(`Created super admin user: ${createdUser.email}`);

        await this.userRoleRepository.save({
          user_id: createdUser.id,
          role_id: superAdminRole.id,
          status: true,
        });
      }
    } catch (error) {
      this.logger.error("Error creating super admin:", error);
      throw error;
    }
  }

  private async createDummyUsers(): Promise<void> {
    try {
      const adminRole = await this.roleRepository.findOne({
        where: { name: "admin" },
      });

      if (!adminRole) {
        throw new Error("Admin role not found");
      }

      const dummyUsers = [
        {
          first_name: "John",
          last_name: "Doe",
          email: "john.doe@example.com",
        },
        {
          first_name: "Jane",
          last_name: "Smith",
          email: "jane.smith@example.com",
        },
        {
          first_name: "Robert",
          last_name: "Johnson",
          email: "robert.johnson@example.com",
        },
        {
          first_name: "Emily",
          last_name: "Brown",
          email: "emily.brown@example.com",
        },
        {
          first_name: "Michael",
          last_name: "Wilson",
          email: "michael.wilson@example.com",
        },
      ];

      const defaultPassword =
        await this.passwordService.hashPassword("Password123@");

      for (const dummyUser of dummyUsers) {
        const existingUser = await this.userRepository.findOne({
          where: { email: dummyUser.email },
        });

        if (!existingUser) {
          const createdUser = await this.userRepository.save({
            ...dummyUser,
            password: defaultPassword,
            status: true,
          });

          await this.userRoleRepository.save({
            user_id: createdUser.id,
            role_id: adminRole.id,
            status: true,
          });

          this.logger.log(`Created dummy user: ${createdUser.email}`);
        } else {
          this.logger.log(`Dummy user already exists: ${dummyUser.email}`);
        }
      }
    } catch (error) {
      this.logger.error("Error creating dummy users:", error);
      throw error;
    }
  }
}
