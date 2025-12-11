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
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);

      if (!user) {
        throw new BadRequestException(
          'Invalid credentials or user does not exist',
        );
      }

      // Sign JWT with _id for faster lookups in validate()
      const token = this.jwtService.sign({
        _id: (user._id as any).toString(),
        email: user.email,
        role: user.role,
      });

      return {
        token,
        user: {
          name: user.name,
          role: user.role,
          email: user.email,
          id: (user._id as any).toString(),
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Return user without password field
    const userObj = user.toJSON();
    const { password: _, ...result } = userObj;
    return result as Omit<User, 'password'>;
  }
}
