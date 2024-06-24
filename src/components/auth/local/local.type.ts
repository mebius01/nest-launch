import { TUser } from "../../users/users.type";

export type TAuthLocalUser = TUser & { password_hash: string; };
