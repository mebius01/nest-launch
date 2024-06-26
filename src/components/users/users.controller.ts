import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './users.dto';
import { TokenGuard } from '../../services/token/token.guard';
import { ERoles, Roles, RolesGuard } from '../../services/roles/roles.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }
  
  // @UseGuards(TokenGuard)
  @Post()
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @UseGuards(TokenGuard)
  @Get()
  list() {
    return this.usersService.list();
  }

  @UseGuards(TokenGuard)
  @Get(':id')
  get(@Param('id') id: string) {
    return this.usersService.get(+id);
  }

  @UseGuards(TokenGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(TokenGuard, RolesGuard)
  @Roles(ERoles.Admin)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.usersService.delete(+id);
  }
}
