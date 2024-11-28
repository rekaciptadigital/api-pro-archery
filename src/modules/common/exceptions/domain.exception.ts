import { HttpException, HttpStatus } from '@nestjs/common';

export class DomainException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super({
      status: 'error',
      message,
      errorCode: `ERR_${status}`,
    }, status);
  }
}