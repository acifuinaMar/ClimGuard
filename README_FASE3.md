# ClimGuard — Fase 3 (microservicios)

```
Navegador ──HTTPS──▶ edge (nginx) ──▶ frontend (Angular, estático)
                          └─ /api, /hubs ─▶ gateway (YARP, valida JWT, CORS, rate limit)
                                              ├─ auth-service       NestJS · PostgreSQL
                                              ├─ community-service  .NET 10 · PostgreSQL
                                              ├─ sensor-service     .NET 10 · SQL Server (+SignalR, simulador)
                                              ├─ alert-service      Java 21 Spring Boot · PostgreSQL
                                              ├─ report-service     FastAPI · MongoDB/GridFS · Jinja2 + WeasyPrint
                                              └─ audit-service      FastAPI · MongoDB
```
Los servicios solo se hablan por HTTP (con el Bearer del usuario o `X-Internal-Key`); cada BD está en una red que comparte únicamente con su servicio.

## Levantar
```bash
./scripts/gen-env.sh        # crea .env con secretos aleatorios (no sobrescribe)
./scripts/gen-certs.sh      # certificado autofirmado para nginx
docker compose up --build   # https://localhost:8443  ·  admin / Admin123 (SEED_DEFAULT_USERS=true)
```
Stack completo ≈ 5–6 GB de RAM. Subconjunto: `docker compose up auth-service audit-service gateway edge frontend`.
Primer arranque: SQL Server y Maven/NuGet/npm tardan varios minutos. Si el 8443/8080 está ocupado, cambie `EDGE_*_PORT` en `.env`.

## Probar sin Docker
`./scripts/test-all.sh` → Report (43), Audit (4), Auth módulos puros (6), Alert evaluador (12), sintaxis YAML de compose/K8s.

## Reportes (API)
`GET /api/reports/types` · `POST /api/reports {type, filters}` → 202 + metadatos (`REP-2026-000001`) · `GET /api/reports/{id}` (estado) ·
`GET /api/reports/{id}/download` (solo administradores) · `GET /api/reports/history` (`X-Total-Count`) · `GET /api/reports/dashboard`.
Tipos: COMMUNITIES, SENSORS, READINGS, ALERTS, EVENT_HISTORY, SENSOR_STATUS, CLIMATE_STATS, EXECUTIVE. UI: menú **Reportes** (administrador) y franja de indicadores en el **Panel**.

## Kubernetes
`python3 scripts/gen-k8s.py` → `k8s/climguard.yaml` (Deployments, Services, probes `/health` `/ready`, Secret de plantilla). Datastores e Ingress TLS se despliegan aparte.

## Estado de requisitos
**Implementados (con evidencia de prueba):** lógica de los 8 reportes con paginación/truncado/filtros (RF-REP-01..08), metadatos e historial (09), descarga restringida (10) y validación JWT firma/issuer/audience/exp/roles/permisos (§13) en Python y Node (interoperabilidad probada contra PyJWT); evaluación de reglas de alerta; compose/K8s sintácticamente válidos.

**Implementados pero NO ejecutados en este entorno** (sin SDK .NET, Docker, Maven Central, npm registry, Mongo/Postgres/SQL Server): endpoints FastAPI y render real WeasyPrint (PDF, encabezado/pie/numeración), GridFS, Gateway YARP, Community, Sensor, Alert (Spring), Auth (NestJS/TypeORM), `ng build` del Angular, imágenes Docker. Es la primera compilación real: espere correcciones menores (paquetes, firmas). Orden sugerido: `docker compose build <servicio>` uno por uno.

**Pendiente / limitaciones conocidas:**
- OAuth2/OIDC: solo preparado (tabla `external_identities`, claims estándar); sin flujo implementado (Fase 4).
- JWT HS256 con clave compartida; para producción conviene RS256/JWKS.
- Esquemas con `EnsureCreated`/`synchronize` (sin migraciones); Postgres compartido por 3 servicios con BD y usuario propios.
- Simulador de lecturas en un solo contenedor (no escalar `sensor-service` a >1 réplica con simulador activo).
- Sin pruebas automatizadas de Gateway/Community/Sensor/Auth (más allá de módulos puros) ni E2E.
- El monolito de la Fase 2 (`ClimGuard Backend/`, `docker-compose.phase2.yml`) se conserva intacto como referencia; su `appsettings.json` contiene credenciales en claro (SA y clave JWT): rotarlas.
- El usuario `admin` del script P2 usa otra contraseña que la semilla de Auth (`Admin123`).
