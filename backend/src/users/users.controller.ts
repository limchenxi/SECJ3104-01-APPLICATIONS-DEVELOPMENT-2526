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
import { TeachingAssignmentService } from 'src/teaching-assignment/teaching-assignment.service';
type RequestWithUser = any; // keep consistent with other controllers

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly teachingAssignmentService: TeachingAssignmentService,
  ) {}

  @Get('me/assignments')
  async getMyAssignments(@Req() req: RequestWithUser) {
    const teacherId = req.user._id;
    const assignmentsData =
      await this.teachingAssignmentService.getAssignmentsByTeacherId(teacherId);
    return assignmentsData;
  }

  @Get('me')
  async getMyProfile(@Req() req: RequestWithUser) {
    return this.userService.findById(req.user._id);
  }

  @Patch('me')
  async updateMyProfile(
    @Req() req: RequestWithUser,
    @Body() updateDto: UpdateUserDto,
  ) {
    return this.userService.updateUser(req.user._id, updateDto);
  }

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

  // Get all users
  @Roles('SUPERADMIN', 'PENTADBIR')
  @Get()
  getAllUsers() {
    return this.userService.findAll();
  }
  @Roles('SUPERADMIN')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateUserDto) {
    return this.userService.updateUser(id, updateDto);
  }
  @Roles('SUPERADMIN')
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  // Get user by ID
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
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
