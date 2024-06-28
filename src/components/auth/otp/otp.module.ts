import { Module } from "@nestjs/common";
import { AuthOtpController } from "./otp.controller";
import { AuthOtpService } from "./otp.service";
import { UsersDal } from "../../../components/users/users.dal";

@Module({
  controllers: [AuthOtpController],
  providers: [AuthOtpService, UsersDal],
})
export class AuthOtpModule { }