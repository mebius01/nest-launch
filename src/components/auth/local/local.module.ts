import { Module } from "@nestjs/common";
import { AuthLocalController } from "./local.controller";
import { AuthLocalService } from "./local.service";
import { UsersDal } from "../../../components/users/users.dal";

@Module({
  controllers: [AuthLocalController],
  providers: [AuthLocalService, UsersDal],
})
export class AuthLocalModule { }