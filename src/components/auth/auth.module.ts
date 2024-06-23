import { Module } from '@nestjs/common';
import {  AuthLocalService } from './auth.service';
import {  AuthLocalDal } from './auth.dal';
import { AuthLocalController } from './auth.controller';

@Module({
  controllers: [AuthLocalController],
  providers: [ AuthLocalService,  AuthLocalDal],
})
export class AuthModule { }