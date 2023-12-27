import { Injectable, Logger, Optional } from '@nestjs/common';
import { DBErrorException } from 'src/services/exceptions/exceptions';

@Injectable()
export class AuthDal {
  constructor(@Optional() private readonly logger = new Logger(AuthDal.name)) {}

  async list() {
    try {
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }
}
