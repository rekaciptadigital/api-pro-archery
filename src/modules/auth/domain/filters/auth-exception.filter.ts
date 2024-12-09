import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { Logger } from '@nestjs/common';

@Catch(HttpException)
export class AuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('AuthException');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();

    const errorResponse = {
      status: {
        code: status,
        message: exception instanceof UnauthorizedException ? 'Unauthorized' : 'Authentication Error',
      },
      error: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    this.logger.error(
      `Auth Error: ${request.method} ${request.url} - ${exception.message}`,
    );

    response.status(status).json(errorResponse);
  }
}