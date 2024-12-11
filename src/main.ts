import 'module-alias/register';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, NotFoundException } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { securityConfig } from './config/security.config';
import { createCorsConfig } from './common/config/cors.config';
import { createSwaggerConfig, swaggerOptions } from './common/config/swagger.config';
import { validationConfig } from './common/config/validation.config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true })
  );

  const configService = app.get(ConfigService);

  // Apply security headers with relaxed settings for development
  await app.register(fastifyHelmet, {
    ...securityConfig,
    contentSecurityPolicy: false
  });

  // Enable CORS
  await app.register(fastifyCors, createCorsConfig(configService));

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe(validationConfig));

  // Swagger documentation setup
  const config = createSwaggerConfig();
  const document = SwaggerModule.createDocument(app, config, swaggerOptions);
  SwaggerModule.setup('api/docs', app, document);

  // Handle root endpoint
  app.getHttpAdapter().get('/', (req, reply) => {
    throw new NotFoundException('Page not found');
  });

  // Start server
  const port = configService.get<number>('port') || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();