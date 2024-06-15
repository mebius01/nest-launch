import { Injectable, Logger, Optional } from '@nestjs/common';
import { DBErrorException } from '../../services/exceptions/exceptions';
import { TUser } from './users.type';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { DBMapper } from 'src/services/database/mapper';

@Injectable()
export class UsersDal {
  constructor(
    @Optional() private readonly logger = new Logger(UsersDal.name),
    private readonly mapper: DBMapper,
  ) { }
  
  async create(payload: CreateUserDto) {
    try {
      const [data] = await this.mapper.create<CreateUserDto, TUser>('users', payload);
      return data
    } catch (error) {
      throw error
    }
  }

  async list() {
    try {
      return await this.mapper.list<TUser[]>('users');
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }

  async get(user_id: number) {
    try {
      const data = await this.mapper.get<TUser>('users', { id: user_id });
      return data
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }

  async update(user_id: number, payload: UpdateUserDto) {
    try {
      return `user ${user_id} updated`;
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }

  async delete(user_id: number) {
    try {
      const [data] = await this.mapper.delete<TUser>('users', { id: user_id });
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }
}
