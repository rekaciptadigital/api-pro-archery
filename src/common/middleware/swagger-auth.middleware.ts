import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SwaggerAuthMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) {}

  use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    const auth = req.headers.authorization;

    if (!auth || !this.validateAuth(auth)) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Swagger Documentation"');
      res.end('Unauthorized');
      return;
    }

    next();
  }

  private validateAuth(auth: string): boolean {
    if (!auth.startsWith('Basic ')) {
      return false;
    }

    const base64Credentials = auth.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    const expectedUsername = this.configService.get<string>('SWAGGER_USERNAME');
    const expectedPassword = this.configService.get<string>('SWAGGER_PASSWORD');

    return username === expectedUsername && password === expectedPassword;
  }
}