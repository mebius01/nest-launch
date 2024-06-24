import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { UsersDal } from './users.dal';
import { TUser } from './users.type';
import { QueueService } from '../../services/queue/queue.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly dal: UsersDal,
    private readonly queueService: QueueService
  ) { }
  
  async create(body: CreateUserDto) {
    const payload: TUser = {
      email: body.email,
      user_name: body.name,
    }
    const user = await this.dal.create(payload);
    await this.queueService.add('sendRegistration', { user })
    return user
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
