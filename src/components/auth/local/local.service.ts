import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthLocalDto } from './local.dto';
import {  AuthLocalDal } from './local.dal';
import { TUser } from '../../users/users.type';
import { TokenService} from '../../../services/token/token.service';
import { TTokenResponse } from '../../../services/token/token.type';


@Injectable()
export class  AuthLocalService {
  constructor(
    private readonly authDal: AuthLocalDal,
    private readonly tokenService: TokenService,
  ) { }

  // //! create -> Users.create
  // async create(body: AuthLocalDto): Promise<TUser> {
  //   const user: TUser = {
  //     email: body.email,
  //     user_name: body.email.split('@')[0],
  //   }
  //   const salt = await bcrypt.genSalt(10);
  //   const password_hash = await bcrypt.hash(body.password, salt);
  //   const data = await this.authDal.create(user, password_hash);
  //   return data
  // }

  async login(body: AuthLocalDto): Promise<TTokenResponse> {
    const getUser = await this.authDal.getUserByEmail(body.email);

    if (!getUser) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { password_hash, ...user } = getUser;

    const passwordMatches = await bcrypt.compare(body.password, password_hash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const access_token = await this.tokenService.create(user);
    return { access_token };
  }
}
