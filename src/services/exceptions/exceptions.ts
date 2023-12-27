import { HttpException, HttpStatus } from '@nestjs/common';

export class DBErrorException extends HttpException {
  constructor() {
    super('DB Error', HttpStatus.SERVICE_UNAVAILABLE);
  }
}
