import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from 'src/users/schemas/user.schema';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Sila log masuk terlebih dahulu');
      // throw new ForbiddenException('User not authenticated');
    }
    // const userRoles: Role[] = user.role || [];
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];

    // const hasRequiredRole = requiredRoles.some((requiredRole) =>
    //   userRoles.includes(requiredRole),
    // );

    // if (!hasRequiredRole) {
    //   throw new ForbiddenException('Insufficient permissions');
    // }
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        'Anda tidak mempunyai kebenaran untuk akses halaman ini',
      );
    }

    return true;
  }
}
