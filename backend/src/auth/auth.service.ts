import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }
    return {
      token: this.jwtService.sign(user),
      user: {
        name: user.name,
        role: user.role,
        email: user.email,
        id: user._id,
      },
    };
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      const { password, ...result } = user.toJSON();
      return result as Omit<User, 'password'>;
    }
    return null;
  }
}
