import { IsEmail, IsNotEmpty } from "class-validator";

export class AuthOtpDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}