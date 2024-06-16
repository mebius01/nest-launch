import { Injectable, Logger, Optional } from '@nestjs/common';
import { DBErrorException } from '../../services/exceptions/exceptions';
import { TUser } from './users.type';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { DBMapper } from 'src/services/database/mapper';
import { ETables } from 'src/services/database/enums';

@Injectable()
export class UsersDal {
  constructor(
    @Optional() private readonly logger = new Logger(UsersDal.name),
    private readonly mapper: DBMapper,
  ) { }
  
  async create(payload: CreateUserDto) {
    const trx = await this.mapper.transaction()
    console.log('[34musers.dal.ts:[33m17[35m(trx)[37m', trx);
    try {
      const [user] = await trx.create<CreateUserDto, TUser>(ETables.Users, payload);
      console.log('[34musers.dal.ts:[33m19[35m(user)[37m', user);
      const [project] = await trx.create(ETables.Projects, {name: 'Test Project name'});
      console.log('[34musers.dal.ts:[33m21[35m(project)[37m', project);
      // await trx.commit()
    } catch (error) {
      // await trx.rollback()
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
