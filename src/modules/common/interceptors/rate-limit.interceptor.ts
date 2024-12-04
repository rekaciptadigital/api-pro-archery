import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  private readonly requestMap = new Map<string, number[]>();

  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!options) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const key = request.ip;
    const now = Date.now();
    const timestamps = this.requestMap.get(key) || [];

    // Remove timestamps outside the current window
    const windowStart = now - options.windowMs;
    const recentTimestamps = timestamps.filter(timestamp => timestamp > windowStart);

    if (recentTimestamps.length >= options.limit) {
      throw new HttpException('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
    }

    recentTimestamps.push(now);
    this.requestMap.set(key, recentTimestamps);

    const response = context.switchToHttp().getResponse();
    response.header('X-RateLimit-Limit', options.limit);
    response.header('X-RateLimit-Remaining', options.limit - recentTimestamps.length);
    response.header('X-RateLimit-Reset', Math.ceil((windowStart + options.windowMs) / 1000));

    return next.handle();
  }
}