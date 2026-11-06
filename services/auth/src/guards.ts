import { CanActivate, ExecutionContext, ForbiddenException, Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Config } from './config';
import { TokenError, verifyToken } from './common/jwt';

export const Permission = (p: string) => SetMetadata('permission', p);
export interface AuthUser { id: number; username: string; role: string; permissions: string[] }

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private cfg: Config, private reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const h: string = req.headers['authorization'] ?? '';
    if (!h.toLowerCase().startsWith('bearer ')) throw new UnauthorizedException('Token requerido');
    let c: Record<string, any>;
    try { c = verifyToken(h.slice(7).trim(), { key: this.cfg.jwtKey, issuer: this.cfg.issuer, audience: this.cfg.audience }); }
    catch (e) { throw new UnauthorizedException(e instanceof TokenError ? e.message : 'Token inválido'); }
    const user: AuthUser = { id: Number(c.sub), username: c.preferred_username, role: c.role, permissions: c.permissions ?? [] };
    if (!Number.isInteger(user.id) || !user.role) throw new ForbiddenException('Token sin sujeto o rol');
    req.user = user;
    const need = this.reflector.get<string | undefined>('permission', ctx.getHandler());
    if (need && !user.permissions.includes(need)) throw new ForbiddenException('Permiso insuficiente');
    return true;
  }
}
