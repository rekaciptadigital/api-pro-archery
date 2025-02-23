import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../../modules/roles/domain/entities/role.entity";
import { Logger } from "@nestjs/common";
import { Seeder } from "./seeder.interface";

@Injectable()
export class RoleSeeder implements Seeder {
  private readonly logger = new Logger(RoleSeeder.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>
  ) {}

  async createMany(): Promise<void> {
    try {
      const roles = [
        {
          name: "super_admin",
          description: "Super Administrator Role",
          status: true,
        },
        {
          name: "admin",
          description: "Administrator Role",
          status: true,
        },
      ];

      for (const role of roles) {
        const existingRole = await this.roleRepository.findOne({
          where: { name: role.name },
        });

        if (!existingRole) {
          await this.roleRepository.save(role);
          this.logger.log(`Created role: ${role.name}`);
        } else {
          this.logger.log(`Role already exists: ${role.name}`);
        }
      }
    } catch (error) {
      this.logger.error("Error seeding roles:", error);
      throw error;
    }
  }
}
