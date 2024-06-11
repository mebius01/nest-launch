import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './users.dto';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(private readonly dal: UsersDal) {}

  async list() {
    try {
      const data = await this.dal.list();
      return data;
    } catch (error) {
      throw error;
    }
  }

  async get(id: number) {
    try {
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
    } catch (error) {
      throw error;
    }
  }

  async delete(id: number) {
    try {
    } catch (error) {
      throw error;
    }
  }
}
