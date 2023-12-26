import { Injectable } from '@nestjs/common';
import { AuthDal } from './auth.dal';

@Injectable()
export class AuthService {
  constructor(private readonly dal: AuthDal) {}

  async test() {
    try {
    } catch (error) {
      throw error;
    }
  }
}
