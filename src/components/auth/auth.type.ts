import { TUser } from "../users/users.type";

export type TAuthLocalUser = TUser & { password_hash: string; };

export type TAuthOtp = {
  otp_id?: number;
  user_id: number;
  otp_code: string;
  expires_at: string;
  created_at?: string;
};