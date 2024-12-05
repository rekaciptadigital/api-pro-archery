import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      // Set CORS headers
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type,Accept,Authorization,Origin,X-Requested-With'
      );
      res.header('Access-Control-Max-Age', '86400');
      
      // End preflight request
      res.status(204).end();
      return;
    }

    // Set CORS headers for actual requests
    res.header('Access-Control-Allow-Origin', '*');
    
    next();
  }
}