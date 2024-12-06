import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      // Set CORS headers
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type,Accept,Authorization,Origin,X-Requested-With'
      );
      res.setHeader('Access-Control-Max-Age', '86400');
      
      // End preflight request
      res.statusCode = 204;
      res.end();
      return;
    }

    // Set CORS headers for actual requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    next();
  }
}