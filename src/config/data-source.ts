import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import { User } from "../modules/users/domain/entities/user.entity";
import { CreateUsersTable1700000000000 } from "../migrations/1700000000000-CreateUsersTable";

config();

const options: DataSourceOptions = {
  type: "postgres",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [User],
  migrations: [CreateUsersTable1700000000000],
  synchronize: false,
};

const dataSource = new DataSource(options);

export default dataSource;
