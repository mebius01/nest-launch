import { Module } from '@nestjs/common';
import {  AuthLocalService } from './auth.service';
import {  AuthLocalDal } from './auth.dal';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [ AuthLocalService,  AuthLocalDal],
})
export class AuthModule { }