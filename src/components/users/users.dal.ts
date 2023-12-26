import {
  BadRequestException,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';

@Injectable()
export class UsersDal {
  constructor(
    @Optional() private readonly logger = new Logger(UsersDal.name),
  ) {}

  async list() {
    try {
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('DB Error');
    }
  }

  async get(id: number) {
    try {
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('DB Error');
    }
  }

  async update(id: number) {
    try {
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('DB Error');
    }
  }

  async delete(id: number) {
    try {
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('DB Error');
    }
  }
}
