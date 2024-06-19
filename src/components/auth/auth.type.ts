import { TUser } from "../users/users.type";

export type TAuthUser = TUser & { password_hash: string; };

export type TToken = {
  token_id?: number;
  user_id: number;
  token: string;
  expires_at: Date;
}