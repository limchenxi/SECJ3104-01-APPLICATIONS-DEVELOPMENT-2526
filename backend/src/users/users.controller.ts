import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/createUser.dto';
import { FindByEmailDto } from './dto/findUser.dto';
import { JwtAuthGuard } from '../auth/jwt.strategy';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
type RequestWithUser = any; // keep consistent with other controllers

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Roles('SUPERADMIN', 'PENTADBIR')
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

  // Return the subjects and classes assigned to the logged-in teacher
  // @UseGuards(JwtAuthGuard)
  // @Get('me')
  // getMyAssignments(@Req() req: RequestWithUser) {
  //   // const userId = req.user._id.toString();
  //   return this.userService.findById(req.user._id);
  // }

  @Patch('me')
  async updateMyProfile(
    @Req() req: RequestWithUser,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(req.user._id, updateDto);
  }

  @Roles('SUPERADMIN')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto, // 👈 使用 UpdateUserDto
  ) {
    return this.userService.updateUser(id, updateDto);
  }

  // Get all users (for admin)
  @Roles('SUPERADMIN', 'PENTADBIR')
  @Get()
  getAllUsers() {
    return this.userService.findAll();
  }

  // Get user by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Roles('SUPERADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    // 注意：此处也需要权限守卫
    return this.userService.deleteUser(id);
  }

  // Update teacher assignments (subjects & classes)
  // @Patch(':id/assignments')
  // updateAssignments(
  //   @Param('id') userId: string,
  //   @Body() body: { subjects: string[]; classes: string[] },
  // ) {
  //   return this.userService.updateAssignments(
  //     userId,
  //     body.subjects,
  //     body.classes,
  //   );
  // }

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
