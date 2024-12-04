import { HttpException, HttpStatus } from '@nestjs/common';

export class DomainException extends HttpException {
  constructor(message: string | string[], status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super({
      status: {
        code: status,
        message: HttpStatus[status]
      },
      error: Array.isArray(message) ? message : [message]
    }, status);
  }
}