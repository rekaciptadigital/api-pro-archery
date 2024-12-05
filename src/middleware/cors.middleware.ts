import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { corsConfig } from '../config/cors.config';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      // Set CORS headers
      res.header('Access-Control-Allow-Origin', this.getOrigin(req.header('Origin')));
      res.header('Access-Control-Allow-Methods', Array.isArray(corsConfig.methods) 
        ? corsConfig.methods.join(',') 
        : corsConfig.methods || 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
      
      res.header('Access-Control-Allow-Headers', Array.isArray(corsConfig.allowedHeaders)
        ? corsConfig.allowedHeaders.join(',')
        : corsConfig.allowedHeaders || 'Content-Type,Accept,Authorization');
      
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', (corsConfig.maxAge || 86400).toString());
      
      // End preflight request
      res.status(204).end();
      return;
    }

    // Set CORS headers for actual requests
    res.header('Access-Control-Allow-Origin', this.getOrigin(req.header('Origin')));
    res.header('Access-Control-Allow-Credentials', 'true');
    
    next();
  }

  private getOrigin(requestOrigin: string | undefined): string {
    const defaultOrigin = 'http://localhost:3000';
    
    if (!requestOrigin) {
      return defaultOrigin;
    }

    const allowedOrigins = Array.isArray(corsConfig.origin) 
      ? corsConfig.origin 
      : typeof corsConfig.origin === 'string' 
        ? [corsConfig.origin]
        : [defaultOrigin];

    // Convert allowedOrigins to string array to handle RegExp cases
    const stringOrigins = allowedOrigins.map(origin => 
      origin instanceof RegExp ? defaultOrigin : origin.toString()
    );

    return stringOrigins.includes(requestOrigin) ? requestOrigin : stringOrigins[0];
  }
}