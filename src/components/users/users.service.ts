import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(private readonly dal: UsersDal) { }
  
  async create(body: CreateUserDto) {
    return await this.dal.create(body);
  }

  async list() {
    return await this.dal.list();
  }

  async get(id: number) {
    return await this.dal.get(id);
  }

  async update(id: number, body: UpdateUserDto) {
    return await this.dal.update(id, body);
  }

  async  delete(id: number) {
    try {
      return await this.dal.delete(id);
    } catch (error) {
      throw error;
    }
  }
}
