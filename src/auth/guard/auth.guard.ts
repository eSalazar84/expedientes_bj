import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { jwtConstants } from "../constants/auth.constants";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) throw new HttpException(
            'No estas autorizado para acceder a esta ruta',
            HttpStatus.UNAUTHORIZED
        );

        try {
            const payload = await this.jwtService.verifyAsync(token, { secret: jwtConstants.secret });
            request['user'] = payload;
        } catch {
            throw new HttpException(
                'No estas autorizado para acceder a esta ruta',
                HttpStatus.UNAUTHORIZED
            );
        }
        return true;
    }
}
