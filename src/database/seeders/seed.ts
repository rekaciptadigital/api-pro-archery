import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { SeederModule } from "./seeder.module";
import { DatabaseSeeder } from "./database.seeder";
import { Logger } from "@nestjs/common";

async function bootstrap() {
  const logger = new Logger("Seeder");

  try {
    const app = await NestFactory.create(SeederModule, new FastifyAdapter());
    const seeder = app.get(DatabaseSeeder);

    // Get seeder name from command line argument
    const seederName = process.argv[2];

    if (seederName) {
      logger.log(`Running specific seeder: ${seederName}`);
      await seeder.seed(seederName);
    } else {
      logger.log("Running all seeders");
      await seeder.seed();
    }

    await app.close();

    logger.log("Seeding completed successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Seeding failed:", error);
    process.exit(1);
  }
}

bootstrap();
