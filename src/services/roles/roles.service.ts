import { SetMetadata, Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TAuthUser } from '../../components/users/users.type';

export enum ERoles {
  Admin = 'Admin',
  User = 'User'
}

export const Roles = (...roles: ERoles[]) => SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<ERoles[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as TAuthUser;
    console.log('FILE: roles.service.ts - LINE: 22 - user: ', user);

    return roles.some(role => user.role_name.includes(role));
  }
}
