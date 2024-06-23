import { Injectable } from "@nestjs/common";
import { DBMapper } from "../../services/database/mapper";
import { TUser } from "../users/users.type";
import { ETables } from "../../services/database/enums";
import { TAuthLocalUser } from "./auth.type";
import { getAuthUserByEmailSql } from "./auth.sql";

@Injectable()
export class  AuthLocalDal { 
  constructor(private readonly mapper: DBMapper) { }

  async create(payload: TUser, password_hash: string): Promise<TUser> {
    await this.mapper.transaction();
    try {
      const [data] = await this.mapper.create<TUser, TUser>(ETables.Users, payload);
      await this.mapper.create(ETables.AuthLocal, { user_id: data.user_id, password_hash });
      await this.mapper.commit();
      return data
    } catch (error) {
      await this.mapper.rollback();
      throw error
    }
  }

  async getUserByEmail(email: string): Promise<TAuthLocalUser> { 
    try {
      const [data] = await this.mapper.raw<TAuthLocalUser>(getAuthUserByEmailSql, { email });
      return data
    } catch (error) {
      throw error;
    }
  }

  async getUserById(user_id: number): Promise<TUser> {
    try {
      const data = await this.mapper.get<TUser>(ETables.Users, { user_id });
      return data
    } catch (error) {
      throw error
    }
  }

}