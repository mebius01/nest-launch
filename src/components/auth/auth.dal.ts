import {
  BadRequestException,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';

@Injectable()
export class AuthDal {
  constructor(@Optional() private readonly logger = new Logger(AuthDal.name)) {}

  async list() {
    try {
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('DB Error');
    }
  }
}
