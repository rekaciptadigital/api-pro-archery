import { HttpException, HttpStatus } from '@nestjs/common';

export class FeatureException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super({
      status: {
        code: status,
        message: HttpStatus[status]
      },
      error: [message]
    }, status);
  }
}