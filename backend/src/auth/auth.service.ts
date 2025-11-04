import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const targetUser = await this.usersService.findUser(loginDto);

    const isMatch = await bcrypt.compare(
      loginDto.password,
      targetUser.password,
    );

    if (isMatch) {
      const { password, ...user } = targetUser;
      return {
        token: this.jwtService.sign(user),
        user: { name: user.name, role: user.role },
      };
    } else {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  // async login(email: string, password: string) {
  //   const user = await this.usersService.findByEmail(email);
  //   if (!user) throw new UnauthorizedException('User not found');

  //   const isMatch = await bcrypt.compare(password, user.password);
  //   if (!isMatch) throw new UnauthorizedException('Invalid credentials');

  //   const payload = { id: user._id, email: user.email, role: user.role };
  //   const token = this.jwtService.sign(payload);

  //   return {
  //     token,
  //     user: {
  //       id: user._id,
  //       email: user.email,
  //       name: user.name,
  //       role: user.role,
  //     },
  //   };
  // }

  // async getProfile(user: any) {
  //   return user;
  // }
}
