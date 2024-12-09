import { FastifyInstance } from 'fastify';
import { ConfigService } from '@nestjs/config';

export const createCorsConfig = (configService: ConfigService) => ({
  origin: true, // Allow all origins in development
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'Origin', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400,
});