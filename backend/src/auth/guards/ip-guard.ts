import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class IpGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const req: Request = context.switchToHttp().getRequest();
        // let clientIP = req.ip || '';

        // if (clientIP === '::1') clientIP = '127.0.0.1';
        // if (clientIP.startsWith('::ffff:')) clientIP = clientIP.split(':').pop()!;

        // console.log('Client IP:', clientIP);

        let clientIP = req.headers['x-forwarded-for'] as string | undefined;

        if (!clientIP) {
            clientIP = req.ip || '';
        }

        if (clientIP.includes(',')) {
            clientIP = clientIP.split(',')[0].trim();
        }

        console.log('Client IP:', clientIP);

        const allowedIPs = (process.env.PUBLIC_IP || '')
            .split(',')
            .map(ip => ip.trim())
            .filter(ip => ip);

        console.log('Allowed IPs:', allowedIPs);

        if (!allowedIPs.includes(clientIP)) {
            throw new ForbiddenException();
        }

        return true;
    }
}
