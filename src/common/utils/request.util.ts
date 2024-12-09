import { FastifyRequest } from 'fastify';

export class RequestUtil {
  static getClientIp(request: FastifyRequest): string {
    return request.ip || '';
  }

  static getUserAgent(request: FastifyRequest): string {
    return request.headers['user-agent'] || '';
  }

  static getAuthToken(request: FastifyRequest): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;
    
    const [bearer, token] = authHeader.split(' ');
    return bearer === 'Bearer' ? token : null;
  }
}