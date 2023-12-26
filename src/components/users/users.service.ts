import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersDal } from './users.dal';

@Injectable()
export class UsersService {
  constructor(private readonly dal: UsersDal) {}

  async list() {
    try {
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
