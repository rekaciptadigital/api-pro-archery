import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let errorMessages: string | string[];
    if (typeof exceptionResponse === 'string') {
      errorMessages = [exceptionResponse];
    } else if (typeof exceptionResponse === 'object') {
      const resp = exceptionResponse as any;
      errorMessages = Array.isArray(resp.message) ? resp.message : 
                     Array.isArray(resp.error) ? resp.error :
                     [resp.message || resp.error || 'An error occurred'];
    } else {
      errorMessages = ['An error occurred'];
    }

    response.status(status).send({
      status: {
        code: status,
        message: HttpStatus[status]
      },
      error: errorMessages
    });
  }
}