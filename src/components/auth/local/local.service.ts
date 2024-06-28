import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersDal } from '../../../components/users/users.dal';
import { AuthLocalDto } from './local.dto';
import { TokenService} from '../../../services/authorization/token/token.service';
import { TTokenResponse } from '../../../services/authorization/type';


@Injectable()
export class  AuthLocalService {
  constructor(
    private readonly userDal: UsersDal,
    private readonly tokenService: TokenService,
  ) { }

  async login(body: AuthLocalDto): Promise<TTokenResponse> {
    const getUser = await this.userDal.getUserByEmail(body.email);

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
