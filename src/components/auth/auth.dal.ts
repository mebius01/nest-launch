import { Injectable } from "@nestjs/common";
import { DBMapper } from "../../services/database/mapper";
import { TUser } from "../users/users.type";
import { ETables } from "../../services/database/enums";
import { TAuthUser, TToken } from "./auth.type";
import { getAuthUserByEmailSql } from "./auth.sql";

@Injectable()
export class  AuthLocalDal { 
  constructor(private readonly mapper: DBMapper) { }

  async create(payload: TUser, password_hash: string): Promise<TUser> {
    await this.mapper.transaction();
    try {
      const [data] = await this.mapper.create<TUser, TUser>(ETables.Users, payload);
      await this.mapper.create(ETables.LocalAuth, { user_id: data.user_id, password_hash });
      await this.mapper.commit();
      return data
    } catch (error) {
      await this.mapper.rollback();
      throw error
    }
  }

  async getUserByEmail(email: string): Promise<TAuthUser> { 
    try {
      const [data] = await this.mapper.raw<TAuthUser>(getAuthUserByEmailSql, { email });
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

  async setTokens(accessToken: TToken, refreshToken: TToken): Promise<void> {
    await this.mapper.transaction();
    try {
      await this.mapper.create(ETables.AccessTokens, accessToken);
      await this.mapper.create(ETables.RefreshTokens, refreshToken);
      await this.mapper.commit();
    } catch (error) {
      await this.mapper.rollback();
      throw error
    }
  }

  async delTokens(user_id?: number): Promise<void> {
    await this.mapper.transaction();
    try {
      if (user_id) {
        await this.mapper.delete(ETables.AccessTokens, { user_id });
        await this.mapper.delete(ETables.RefreshTokens, { user_id });
      } else {
        await this.mapper.delete(ETables.AccessTokens);
        await this.mapper.delete(ETables.RefreshTokens);
      }
      await this.mapper.commit();
    } catch (error) {
      await this.mapper.rollback();
      throw error
    }
  }

  async getRefreshTokenByToken(token: string): Promise<TToken> {
    try {
      const data = await this.mapper.get<TToken>(ETables.RefreshTokens, { token });
      return data
    } catch (error) {
      throw error
    }
  }
}