import { TUser } from "../users/users.type";

export type TAuthUser = TUser & { password_hash: string }