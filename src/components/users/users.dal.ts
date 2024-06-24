import { Injectable } from '@nestjs/common';
import { TUser } from './users.type';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { DBMapper } from '../../services/database/mapper';
import { ETables } from '../../services/database/enums';

@Injectable()
export class UsersDal {
  constructor(private readonly mapper: DBMapper) { }
  
  async create(payload: TUser) {
    try {
      const [data] = await this.mapper.upsert<TUser, TUser>(ETables.Users, payload, ['email'], false);
      return data
    } catch (error) {
      throw error
    }
  }

  async list() {
    try {
      return await this.mapper.list<TUser[]>(ETables.Users);
    } catch (error) {
      throw error
    }
  }

  async get(user_id: number) {
    try {
      const data = await this.mapper.get<TUser>(ETables.Users, { id: user_id });
      return data
    } catch (error) {
      throw error
    }
  }

  async update(user_id: number, payload: UpdateUserDto) {
    try {
      const [data] = await this.mapper.update<UpdateUserDto, TUser>(ETables.Users, { id: user_id }, payload);
      return data
    } catch (error) {
      throw error
    }
  }

  async delete(user_id: number) {
    try {
      const [data] = await this.mapper.delete<TUser>(ETables.Users, { id: user_id });
      return data;
    } catch (error) {
      throw error
    }
  }
}
