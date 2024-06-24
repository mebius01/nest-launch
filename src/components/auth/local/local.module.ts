import { Module } from "@nestjs/common";
import { AuthLocalController } from "./local.controller";
import { AuthLocalService } from "./local.service";
import { AuthLocalDal } from "./local.dal";

@Module({
  controllers: [AuthLocalController],
  providers: [AuthLocalService, AuthLocalDal],
})
export class AuthLocalModule { }