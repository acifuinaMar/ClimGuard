import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { toUsuarioDto } from './common/legacy';
import { AuthService, UserInput } from './auth.service';
import { JwtGuard, Permission } from './guards';

@Controller()
export class AuthController {
  constructor(private svc: AuthService) {}

  // /api/auth/login y alias /api/login (Angular de Fase 2)
  @Post(['api/auth/login', 'api/login']) @HttpCode(200)
  login(@Body() b: { nombreUsuario?: string; username?: string; contraseña?: string; password?: string }) {
    return this.svc.login(b.nombreUsuario ?? b.username ?? '', b['contraseña'] ?? b.password ?? '');
  }

  @Get('api/auth/me') @UseGuards(JwtGuard)
  me(@Req() req: any) { return req.user; }

  /** Stateless: el cliente descarta el token; el evento queda en auditoría. */
  @Post('api/auth/logout') @HttpCode(204) @UseGuards(JwtGuard)
  logout() { return; }

  @Get(['api/users', 'api/Usuario']) @UseGuards(JwtGuard) @Permission('users.manage')
  async list() { return (await this.svc.list()).map(toUsuarioDto); }

  @Get(['api/users/:id', 'api/Usuario/:id']) @UseGuards(JwtGuard) @Permission('users.manage')
  async get(@Param('id', ParseIntPipe) id: number) { return toUsuarioDto(await this.svc.get(id)); }

  @Post(['api/users', 'api/Usuario']) @UseGuards(JwtGuard) @Permission('users.manage')
  async create(@Body() b: UserInput, @Req() req: any) { return toUsuarioDto(await this.svc.create(b, req.user)); }

  @Put(['api/users/:id', 'api/Usuario/:id']) @UseGuards(JwtGuard) @Permission('users.manage')
  async update(@Param('id', ParseIntPipe) id: number, @Body() b: UserInput, @Req() req: any) {
    return toUsuarioDto(await this.svc.update(id, b, req.user));
  }

  @Delete(['api/users/:id', 'api/Usuario/:id']) @HttpCode(204) @UseGuards(JwtGuard) @Permission('users.manage')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) { await this.svc.remove(id, req.user); }
}
