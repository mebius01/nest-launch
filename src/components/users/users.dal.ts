import { Injectable, Logger, Optional } from '@nestjs/common';
import { DBErrorException } from '../../services/exceptions/exceptions';
import { TUser } from './users.type';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { DBMapper } from '../../services/database/mapper';
import { ETables } from '../../services/database/enums';

@Injectable()
export class UsersDal {
  constructor(
    @Optional() private readonly logger = new Logger(UsersDal.name),
    private readonly mapper: DBMapper,
  ) { }
  
  async create(payload: CreateUserDto) {
    await this.mapper.transaction();
    try {
      const [data] = await this.mapper.create<CreateUserDto, TUser>(ETables.Users, payload);
      return data
    } catch (error) {
      throw error
    }
  }

  async list() {
    try {
      return await this.mapper.list<TUser[]>(ETables.Users);
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }

  async get(user_id: number) {
    try {
      const data = await this.mapper.get<TUser>(ETables.Users, { id: user_id });
      return data
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }

  async getByEmail(email: string) {
    const sql = `select u.* from ${ETables.Users} u where u.email = :email`
    try {
      const data = await this.mapper.raw<TUser>(sql, { email });
      return data
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }

  async update(user_id: number, payload: UpdateUserDto) {
    try {
      const [data] = await this.mapper.update<UpdateUserDto, TUser>(ETables.Users, { id: user_id }, payload);
      return data
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }

  async delete(user_id: number) {
    try {
      const [data] = await this.mapper.delete<TUser>(ETables.Users, { id: user_id });
      return data;
    } catch (error) {
      this.logger.error(error);
      throw new DBErrorException();
    }
  }
}
