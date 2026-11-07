# ClimGuard — Fase 3 (microservicios)

> **Documento histórico — Fase 3 (noviembre de 2026).** Se conserva como registro de esa etapa: describe lo que se había implementado, probado y pendiente *en ese momento*. Varias afirmaciones (por ejemplo «no compilado» o «no ejecutado») quedaron superadas en la Fase 4. Documentación vigente de ClimGuard 4.1: [docs/README.md](../../README.md).

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
docker compose up --build   # https://localhost:8443  ·  usuarios demo solo con SEED_DEFAULT_USERS=true (desarrollo local; nunca en producción)
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
- El usuario `admin` del script P2 usaba otra contraseña que la semilla de desarrollo de Auth. *(Nota 4.1: ambas son contraseñas débiles de la Fase 2; ver la advertencia de seguridad en [docs/README.md](../../README.md).)*

## Cambios de estabilización (noviembre 2026)

Ver `CAMBIOS-REALIZADOS.md`, `MIGRACIONES.md`, `PRUEBAS.md`, `DESPLIEGUE-SEGURO.md`, `RECURSOS-VPS.md`, `REVISION-INTEGRACION.md` y `RIESGOS-PENDIENTES.md` en la raíz del proyecto.
Resumen: sensores `FISICO`/`SIMULADO`; reglas de alerta con intervalo de peligro `[min,max]` inclusivo (las reglas previas quedan como legadas y se siguen evaluando como antes hasta una conversión explícita);
reportes PDF por trozos con tope explícito (`REPORT_MAX_ROWS=100` inicial, `REPORT_ON_LIMIT`), cola limitada y limpieza de temporales.

## Estado del código al iniciar la Fase 3
*(Antes en `FASE3_ESTADO_REAL.md`.)*

### Código encontrado en proyecto3
- Monolito Fase 2 .NET + SQL Server y frontend Angular.
- Gateway YARP .NET 10, Report FastAPI + MongoDB, Audit FastAPI + MongoDB.
- Docker Compose base y override parcial de Fase 3.

### Mejoras de esta entrega
- Gateway exige JWT válido en rutas proxificadas salvo login, aplica límite de peticiones y conserva el hub SignalR.
- Nginx encamina SignalR al Gateway y elimina rutas /reports y /audit que no tenían correspondencia con las rutas de YARP.
- Report Service conserva los PDF generados en MongoDB GridFS y permite volver a descargarlos mediante `GET /api/reports/{reportId}/download`; registra descargas.
- Audit Service usa un objeto independiente para `detail` en cada solicitud.

### Bloqueos conocidos (NO considerar Fase 3 finalizada)
- No existen microservicios independientes Auth/NestJS, Community/.NET+Postgres, Sensor/.NET+SQL Server, Alert/Java+Postgres.
- Los reportes siguen consultando endpoints del monolito; únicamente hay cuatro tipos genéricos, no los diez requisitos completos.
- Las rutas reales de Login deben comprobarse frente a los controladores y la UI; los tokens deben usar la misma clave, issuer y audience.
- El `docker-compose.phase3.yml` es un override y se ejecuta junto al `docker-compose.yml`; este último expone los puertos 8080 y 1433 del monolito/SQL Server y deben cerrarse antes de producción.
- No se ha ejecutado `dotnet build`, `docker compose` ni pruebas end-to-end en este entorno.

### Comando de integración (solo ambiente de pruebas)
`docker compose -f docker-compose.yml -f docker-compose.phase3.yml --env-file .env config`

No subir este paquete directamente a producción sin pruebas y copia de seguridad.

## Documentos de esta fase
| Documento | Contenido |
|---|---|
| [CAMBIOS-REALIZADOS.md](CAMBIOS-REALIZADOS.md) | Bitácora de estabilización (sensores físico/simulado, semántica de reglas, reportes PDF) |
| [MIGRACIONES.md](../../MIGRACIONES.md) | Scripts SQL (documento vigente, actualizado para 4.1) |
| [PRUEBAS.md](PRUEBAS.md) · [REVISION-INTEGRACION.md](REVISION-INTEGRACION.md) | Qué se pudo probar y compilar entonces |
| [DESPLIEGUE-SEGURO.md](DESPLIEGUE-SEGURO.md) | Procedimiento con Docker Compose (proyecto `climguard3`), reemplazado por K3s |
| [RECURSOS-VPS.md](RECURSOS-VPS.md) | Límites y mediciones de los reportes PDF |
| [RIESGOS-PENDIENTES.md](RIESGOS-PENDIENTES.md) | Riesgos abiertos al cierre de la Fase 3 (estado actual: [riesgos-y-pendientes.md](../../riesgos-y-pendientes.md)) |
