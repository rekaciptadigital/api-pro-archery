import { HttpException, HttpStatus } from '@nestjs/common';

export class PaginationException extends HttpException {
  constructor(message: string) {
    super(
      {
        status: 'error',
        message,
        errorCode: 'PAGINATION_ERROR',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}