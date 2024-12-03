import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import { User } from "../modules/users/domain/entities/user.entity";
import { Role } from "../modules/roles/domain/entities/role.entity";
import { Feature } from "../modules/features/domain/entities/feature.entity";
import { RoleFeaturePermission } from "../modules/permissions/domain/entities/role-feature-permission.entity";
import { UserRole } from "../modules/user-roles/domain/entities/user-role.entity";
import { CreateInitialSchema1701234567890 } from "../migrations/1701234567890-CreateInitialSchema";
import { CreateUserRolesTable1701234567891 } from "../migrations/1701234567891-CreateUserRolesTable";
import { AddStatusToRolesAndFeatures1701234567892 } from "../migrations/1701234567892-AddStatusToRolesAndFeatures";

config();

const options: DataSourceOptions = {
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User, Role, Feature, RoleFeaturePermission, UserRole],
  migrations: [
    CreateInitialSchema1701234567890,
    CreateUserRolesTable1701234567891,
    AddStatusToRolesAndFeatures1701234567892
  ],
  synchronize: false,
};

const dataSource = new DataSource(options);

export default dataSource;