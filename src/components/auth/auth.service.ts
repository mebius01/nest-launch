import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { AuthDto } from './auth.dto';
import { AuthDal } from './auth.dal';
import { TUser } from '../users/users.type';
import { UsersDal } from '../users/users.dal';

@Injectable()
export class AuthService {
  constructor(
    private readonly authDal: AuthDal
  ) { }

  async create(body: AuthDto): Promise<TUser> {
    const user: TUser = {
      email: body.email,
      user_name: body.email.split('@')[0],

    }
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(body.password, salt);
    const data = await this.authDal.create(user, password_hash);
    return data
  }

  async login(body: AuthDto) {
    const user = await this.authDal.getUserByEmail(body.email);
    if (!user) {
      throw new Error('User not found');
    }

    const passwordMatches = await bcrypt.compare(body.password, user.password_hash);
    if (!passwordMatches) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // await this.tokenService.create(user.id, token, new Date(Date.now() + 3600000));

    // const redisClient = this.redisService.getClient();
    // await redisClient.set(`user:${user.id}`, JSON.stringify(user));

    // return token;
  }

  // async logout(userId: number): Promise<void> {
  //   await this.tokenService.deleteByUserId(userId);

  //   const redisClient = this.redisService.getClient();
  //   await redisClient.del(`user:${userId}`);
  // }

  // async logoutAll(): Promise<void> {
  //   await this.tokenService.deleteAll();

  //   const redisClient = this.redisService.getClient();
  //   const keys = await redisClient.keys('user:*');
  //   for (const key of keys) {
  //     await redisClient.del(key);
  //   }
  // }
}