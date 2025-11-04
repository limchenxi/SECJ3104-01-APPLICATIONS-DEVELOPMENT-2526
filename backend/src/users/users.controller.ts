import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/createUser.dto';
import { FindByEmailDto } from './dto/findUser.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    if (
      !createUserDto.email ||
      !createUserDto.password ||
      !createUserDto.role
    ) {
      throw new BadRequestException('Email, password and role are required');
    }
    return this.userService.createUser(
      createUserDto.name || '',
      createUserDto.email,
      createUserDto.password,
      createUserDto.role,
    );
  }

  @Get('find-by-email')
  findByEmail(@Query() findByEmailDto: FindByEmailDto) {
    const { email } = findByEmailDto;
    return this.userService.findByEmail(email);
  }
}
