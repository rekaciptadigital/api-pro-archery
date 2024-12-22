import { NestFactory } from '@nestjs/core';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { SeederModule } from './seeder.module';
import { DatabaseSeeder } from './database.seeder';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Seeder');

  try {
    const app = await NestFactory.create(SeederModule, new FastifyAdapter());
    const seeder = app.get(DatabaseSeeder);
    
    await seeder.seed();
    await app.close();
    
    logger.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

bootstrap();