import { Injectable } from "@nestjs/common";
import { DBMapper } from "../../../services/database/mapper";
import { TUser } from "../../users/users.type";
import { ETables } from "../../../services/database/enums";

@Injectable()
export class AuthOtpDal {
  constructor(private readonly mapper: DBMapper) { }

  async getUserByEmail(email: string): Promise<TUser> {
    try {
      const data = await this.mapper.get<TUser>(ETables.Users, { email });
      return data;
    } catch (error) {
      throw error;
    }
  }

}