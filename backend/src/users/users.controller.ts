import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/createUser.dto';
import { FindByEmailDto } from './dto/findUser.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  // @Get('find-by-email')
  // findByEmail(@Query() findByEmailDto: FindByEmailDto) {
  //   const { email } = findByEmailDto;
  //   return this.userService.findByEmail(email);
  // }

  @Get('find-by-email')
  findByEmail(@Query() query: FindByEmailDto) {
    return this.userService.findByEmail(query.email);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('profile')
  // async getProfile(@Req() req) {
  //   return this.userService.findById(req.user.id);
  // }

  // @UseGuards(JwtAuthGuard)
  // @Put('profile')
  // async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
  //   return this.userService.updateUser(req.user.id, updateUserDto);
  // }
}
