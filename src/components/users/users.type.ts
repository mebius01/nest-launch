export type TUser = {
  user_id?: number;
  email: string;
  user_name: string;
  role_id?: number;
};

export type TAuthUser = TUser & {
  password_hash: string;
  role_name: string
};

