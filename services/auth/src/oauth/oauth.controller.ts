import { Body, Controller, Get, HttpCode, Param, Post, Query, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { Config } from '../config';
import { JwtGuard } from '../guards';
import { readCookie } from './crypto';
import { OAuthService } from './oauth.service';
import { OAuthError } from './types';

const COOKIE = 'cg_oauth_bind';
const PATH = '/api/auth/oauth';

@Controller('api/auth/oauth')
export class OAuthController {
  constructor(private svc: OAuthService, private cfg: Config) {}

  /** Anónima: qué botones mostrar. No expone ids ni secretos. */
  @Get('providers')
  providers(@Res({ passthrough: true }) res: any) { this.noStore(res); return { providers: this.svc.core.listProviders() }; }

  /** Inicio: guarda state/nonce/PKCE en servidor, fija la cookie de navegador y redirige al proveedor. */
  @Get(':provider/start')
  async start(@Param('provider') provider: string, @Res() res: any) {
    try {
      const { url, binding } = await this.svc.core.start(provider);
      this.noStore(res); this.setCookie(res, binding, this.cfg.oauth.flowTtlSeconds);
      return res.redirect(302, url);
    } catch (e) { return this.fail(res, e instanceof OAuthError ? e.reason : 'provider_unavailable'); }
  }

  /** Vincular un proveedor a la cuenta con sesión iniciada. Requiere Bearer; devuelve la URL (no se puede redirigir con cabecera). */
  @Post(':provider/link') @HttpCode(200) @UseGuards(JwtGuard)
  async link(@Param('provider') provider: string, @Req() req: any, @Res({ passthrough: true }) res: any) {
    try {
      const { url, binding } = await this.svc.core.start(provider, { linkUserId: req.user.id });
      this.noStore(res); this.setCookie(res, binding, this.cfg.oauth.flowTtlSeconds);
      return { authorizationUrl: url };
    } catch (e) { throw new UnauthorizedException({ mensaje: 'No se pudo iniciar la vinculación.', motivo: e instanceof OAuthError ? e.reason : 'provider_unavailable' }); }
  }

  /** Retorno del proveedor. Redirige siempre al frontend; el JWT nunca viaja en la URL. */
  @Get(':provider/callback')
  async callback(@Param('provider') provider: string, @Query() q: Record<string, string | undefined>, @Req() req: any, @Res() res: any) {
    this.noStore(res);
    const binding = readCookie(req.headers.cookie, COOKIE);
    let r;
    try { r = await this.svc.core.callback(provider, { code: str(q.code), state: str(q.state), error: str(q.error) }, binding); }
    catch { r = { kind: 'error' as const, reason: 'provider_unavailable' as const }; }   // p. ej. BD caída: nunca un 500 en una navegación
    const fe = this.cfg.oauth.frontendUrl;
    if (r.kind === 'login') {
      this.setCookie(res, binding!, this.cfg.oauth.codeTtlSeconds + 30);       // el canje (POST) debe llevar la misma cookie
      return res.redirect(302, `${fe}/auth/callback#code=${r.code}`);          // fragmento: no llega a logs ni Referer
    }
    this.clearCookie(res);
    return res.redirect(302, r.kind === 'linked' ? `${fe}/auth/callback#linked=1` : `${fe}/login?oauth_error=${r.reason}`);
  }

  /** Canje del código de un solo uso por la sesión ClimGuard (mismo JSON que /api/auth/login). */
  @Post('exchange') @HttpCode(200)
  async exchange(@Body() b: { code?: string }, @Req() req: any, @Res({ passthrough: true }) res: any) {
    this.noStore(res);
    const session = await this.svc.exchange(str(b?.code), readCookie(req.headers.cookie, COOKIE));
    this.clearCookie(res);
    if (!session) throw new UnauthorizedException({ usuarioId: 0, usuario: '', token: '', mensaje: 'El código no es válido o expiró.' });
    return session;
  }

  // ---- helpers ----
  private fail(res: any, reason: string) { this.clearCookie(res); return res.redirect(302, `${this.cfg.oauth.frontendUrl}/login?oauth_error=${reason}`); }
  private noStore(res: any) { res.setHeader('Cache-Control', 'no-store'); res.setHeader('Pragma', 'no-cache'); res.setHeader('Referrer-Policy', 'no-referrer'); }
  private setCookie(res: any, value: string, maxAge: number) {
    res.setHeader('Set-Cookie', `${COOKIE}=${value}; Path=${PATH}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${this.cfg.oauth.cookieSecure ? '; Secure' : ''}`);
  }
  private clearCookie(res: any) {
    res.setHeader('Set-Cookie', `${COOKIE}=; Path=${PATH}; HttpOnly; SameSite=Lax; Max-Age=0${this.cfg.oauth.cookieSecure ? '; Secure' : ''}`);
  }
}
const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
