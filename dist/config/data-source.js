"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const user_entity_1 = require("../modules/users/domain/entities/user.entity");
const _1700000000000_CreateUsersTable_1 = require("../migrations/1700000000000-CreateUsersTable");
(0, dotenv_1.config)();
const options = {
    type: "postgres",
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [user_entity_1.User],
    migrations: [_1700000000000_CreateUsersTable_1.CreateUsersTable1700000000000],
    synchronize: false,
};
const dataSource = new typeorm_1.DataSource(options);
exports.default = dataSource;
//# sourceMappingURL=data-source.js.map