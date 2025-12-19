import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class IpGuard implements CanActivate {
  private isIpAllowed(clientIP: string, allowedIPs: string[]): boolean {
    return allowedIPs.some((allowedPattern) => {
      if (allowedPattern === clientIP) {
        return true;
      }

      if (allowedPattern.endsWith('*')) {
        const requiredPrefix = allowedPattern.slice(0, -1);
        return clientIP.startsWith(requiredPrefix);
      }

      return false;
    });
  }

  canActivate(context: ExecutionContext): boolean {
    const req: Request = context.switchToHttp().getRequest();

    let clientIP = req.headers['x-forwarded-for'] as string | undefined;

    if (!clientIP) {
      clientIP = req.ip || '';
    }

    if (clientIP.includes(',')) {
      clientIP = clientIP.split(',')[0].trim();
    }

    const allowedIPs = (process.env.PUBLIC_IP || '')
      .split(',')
      .map((ip) => ip.trim())
      .filter((ip) => ip);

    console.log('Client IP:', clientIP);
    console.log('Allowed IPs:', allowedIPs);

    if (!this.isIpAllowed(clientIP, allowedIPs)) {
      throw new ForbiddenException();
    }

    return true;
  }
}
