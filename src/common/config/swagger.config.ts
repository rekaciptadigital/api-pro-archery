import { DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';

export const createSwaggerConfig = () => {
  return new DocumentBuilder()
    .setTitle('Inventory Management API')
    .setDescription('API documentation for Inventory Management System')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
};

export const swaggerOptions: SwaggerDocumentOptions = {
  operationIdFactory: (
    controllerKey: string,
    methodKey: string
  ) => methodKey
};