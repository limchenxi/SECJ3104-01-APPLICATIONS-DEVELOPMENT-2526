import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt.strategy';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,

    private readonly userService: UsersService,
  ) {}

  // @Post('login')
  // async login(@Body() dto: LoginDto) {
  //   return this.authService.login(dto.email, dto.password);
  // }
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: RequestWithUser) {
    const result = await this.userService.findById(req.user._id as string);
    if (!result) {
      throw new NotFoundException('User not found');
    }
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { password, ...user } = result.toJSON();
    return user;
  }
}
