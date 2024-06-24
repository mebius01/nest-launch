import { Module } from "@nestjs/common";
import { AuthOtpController } from "./otp.controller";
import { AuthOtpService } from "./otp.service";
import { AuthOtpDal } from "./otp.dal";

@Module({
  controllers: [AuthOtpController],
  providers: [AuthOtpService, AuthOtpDal],
})
export class AuthOtpModule { }