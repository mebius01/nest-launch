import {
  BadRequestException,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import { DBErrorException } from '../../services/exceptions/exceptions';

@Injectable()
export class UsersDal {
  constructor(
    @Optional() private readonly logger = new Logger(UsersDal.name),
  ) {}

  async list() {
    try {
      return 'list of users';
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }

  async get(user_id: number) {
    try {
      return `user ${user_id}`;
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }

  async update(user_id: number) {
    try {
      return `user ${user_id} updated`;
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }

  async delete(user_id: number) {
    try {
      return `user ${user_id} deleted`;
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }
}
