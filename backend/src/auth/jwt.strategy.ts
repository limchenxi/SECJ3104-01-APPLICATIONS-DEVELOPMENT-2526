import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'jsonwebtoken';
import { UsersService } from 'src/users/users.service';
import { Role, User } from 'src/users/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET') || 'test-secret-key';
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(
    payload: JwtPayload & { email: string; _id?: string; role?: Role[] },
  ) {
    let user: User | null = null;
    if (payload._id) {
      user = await this.userService.findById(payload._id);
      // return user;
    } else {
      user = await this.userService.findByEmail(payload.email);
    }
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userObj = user.toJSON<User>();

    /** eslint-disable-next-line @typescript-eslint/no-unused-vars */
    const { password, ...result } = userObj;

    if (!Array.isArray(result.role)) {
      result.role = result.role ? [result.role] : [];
    }

    return result;
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
