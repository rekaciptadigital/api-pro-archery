import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiErrorResponse } from '../interfaces/api-response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: ApiErrorResponse = {
      status: {
        code: status,
        message: HttpStatus[status],
      },
      error: {
        code: `ERR_${status}`,
        message: typeof exceptionResponse === 'string' 
          ? exceptionResponse 
          : (exceptionResponse as any).message || 'An error occurred',
        details: typeof exceptionResponse === 'object' 
          ? (exceptionResponse as any) 
          : undefined,
      },
    };

    response.status(status).json(errorResponse);
  }
}