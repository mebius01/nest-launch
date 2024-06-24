import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class AuthLocalDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  password: string;
}