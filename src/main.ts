import { NestFactory } from '@nestjs/core';
import { ValidationPipe, NotFoundException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { securityConfig } from './config/security.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply security headers
  app.use(helmet(securityConfig));
  
  // Enable CORS with custom configuration
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization,Origin,X-Requested-With',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: false,
    maxAge: 86400
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Inventory Management API')
    .setDescription('API documentation for Inventory Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Handle root endpoint
  app.use('/', (req: Request, res: Response, next: NextFunction) => {
    if (req.url === '/') {
      throw new NotFoundException('Page not found');
    }
    next();
  });

  // Start server
  await app.listen(process.env.PORT || 4000);
}
bootstrap();