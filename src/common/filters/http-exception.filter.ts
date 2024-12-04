import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let errorMessages: string | string[];
    if (typeof exceptionResponse === 'string') {
      errorMessages = exceptionResponse;
    } else if (typeof exceptionResponse === 'object') {
      const resp = exceptionResponse as any;
      errorMessages = resp.message || resp.error || 'An error occurred';
    } else {
      errorMessages = 'An error occurred';
    }

    response.status(status).json({
      code: status,
      message: HttpStatus[status],
      error: Array.isArray(errorMessages) ? errorMessages : [errorMessages],
    });
  }
}