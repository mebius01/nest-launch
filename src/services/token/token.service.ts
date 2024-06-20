import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class TokenService {

  async create(user_id: number) { }

  async verify(token: string) { }

  async refresh(token: string) { }

}