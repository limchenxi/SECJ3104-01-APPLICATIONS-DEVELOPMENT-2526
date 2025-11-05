import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @Post('login')
  // async login(@Body() dto: LoginDto) {
  //   return this.authService.login(dto.email, dto.password);
  // }
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // @UseGuards(JwtAuthGuard)
  // @Get('me')
  // async getProfile(@Req() req) {
  //   return this.authService.getProfile(req.user);
  // }
}
