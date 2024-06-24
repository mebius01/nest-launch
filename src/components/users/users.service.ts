import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { UsersDal } from './users.dal';
import { TUser } from './users.type';

@Injectable()
export class UsersService {
  constructor(private readonly dal: UsersDal) { }
  
  async create(body: CreateUserDto) {
    const payload: TUser = {
      email: body.email,
      user_name: body.name,
    }
    const data = await this.dal.create(payload);
    //! send data to mailService
    console.log('send data to mailService', data);
    return data
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
