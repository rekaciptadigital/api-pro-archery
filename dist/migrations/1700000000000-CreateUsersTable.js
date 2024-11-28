"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUsersTable1700000000000 = void 0;
class CreateUsersTable1700000000000 {
    constructor() {
        this.name = 'CreateUsersTable1700000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'user')
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" character varying NOT NULL,
                "password" character varying NOT NULL,
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "role" "public"."users_role_enum" NOT NULL DEFAULT 'user',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }
}
exports.CreateUsersTable1700000000000 = CreateUsersTable1700000000000;
//# sourceMappingURL=1700000000000-CreateUsersTable.js.map