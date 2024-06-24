import { Injectable } from "@nestjs/common";
import { DBMapper } from "../../../services/database/mapper";
import { TAuthLocalUser } from "./local.type";
import { getAuthUserByEmailSql } from "./local.sql";

@Injectable()
export class  AuthLocalDal { 
  constructor(private readonly mapper: DBMapper) { }

  async getUserByEmail(email: string): Promise<TAuthLocalUser> { 
    try {
      const [data] = await this.mapper.raw<TAuthLocalUser>(getAuthUserByEmailSql, { email });
      return data
    } catch (error) {
      throw error;
    }
  }

}