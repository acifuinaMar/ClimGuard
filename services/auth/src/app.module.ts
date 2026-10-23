import { Controller, Get, Inject, Module, OnApplicationBootstrap, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource, TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuditClient } from './audit';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Config, loadConfig } from './config';
import { ExternalIdentity, User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { JwtGuard } from './guards';

@Controller()
class HealthController {
  constructor(@InjectDataSource() private ds: DataSource) {}
  @Get('health') health() { return { status: 'ok' }; }
  @Get('ready') async ready() {
    try { await this.ds.query('SELECT 1'); return { status: 'ready' }; }
    catch { throw new ServiceUnavailableException({ status: 'db-unavailable' }); }
  }
}

const cfg = loadConfig();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', host: cfg.db.host, port: cfg.db.port, username: cfg.db.user, password: cfg.db.password,
      database: cfg.db.database, ssl: cfg.db.ssl, entities: [User, Role, ExternalIdentity],
      // Esquema pequeño y propio del servicio; en producción real se usarían migraciones.
      synchronize: process.env.DB_SYNCHRONIZE !== 'false', retryAttempts: 15, retryDelay: 3000,
    }),
    TypeOrmModule.forFeature([User, Role]),
  ],
  controllers: [AuthController, HealthController],
  providers: [
    { provide: Config, useValue: cfg }, AuditClient, AuthService, JwtGuard,
  ],
})
export class AppModule implements OnApplicationBootstrap {
  constructor(@Inject(AuthService) private auth: AuthService) {}
  async onApplicationBootstrap() { await this.auth.seed(); }
}
