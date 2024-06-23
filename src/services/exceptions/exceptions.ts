import { HttpException, HttpStatus } from '@nestjs/common';

export class DBErrorException extends HttpException {
  constructor() {
    super('DB Error', HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class RedisErrorException extends HttpException {
  constructor() {
    super('Redis Error', HttpStatus.SERVICE_UNAVAILABLE);
  }
}

export class EmailErrorException extends HttpException {
  constructor() {
    super('Email Error', HttpStatus.SERVICE_UNAVAILABLE);
  }
}