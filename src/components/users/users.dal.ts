import {
  BadRequestException,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import { DBErrorException } from 'src/services/exceptions/exceptions';

@Injectable()
export class UsersDal {
  constructor(
    @Optional() private readonly logger = new Logger(UsersDal.name),
  ) {}

  async list() {
    try {
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }

  async get(id: number) {
    try {
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }

  async update(id: number) {
    try {
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }

  async delete(id: number) {
    try {
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }
}
