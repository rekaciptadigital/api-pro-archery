import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuthLogger');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { ip, method, path, body } = request;
    const userAgent = request.headers['user-agent'] || '';
    const timestamp = new Date().toISOString();

    return next.handle().pipe(
      tap({
        next: (response) => {
          this.logger.log(
            `[${timestamp}] ${method} ${path} ${ip} ${userAgent} - Success`,
          );
        },
        error: (error) => {
          this.logger.error(
            `[${timestamp}] ${method} ${path} ${ip} ${userAgent} - ${error.message}`,
          );
        },
      }),
    );
  }
}