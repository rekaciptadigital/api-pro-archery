import { NestFactory } from '@nestjs/core';
import { ValidationPipe, NotFoundException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
  }));
  
  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:4000', 
      'https://inventory.proarchery.id'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Access-Control-Allow-Origin'
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Inventory Management API')
    .setDescription('API documentation for Inventory Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Custom middleware to handle CORS preflight
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Max-Age', '86400');
      res.status(204).end();
      return;
    }
    next();
  });

  // Handle root endpoint
  app.use('/', (req: Request, res: Response, next: NextFunction) => {
    if (req.url === '/') {
      throw new NotFoundException('Page not found');
    }
    next();
  });

  await app.listen(process.env.PORT || 4000);
}
bootstrap();