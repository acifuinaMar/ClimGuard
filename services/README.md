# Microservicios de ClimGuard 4.1

Todos los servicios exponen `GET /health` (vida del proceso) y `GET /ready` (dependencias listas; en los servicios con base de datos comprueba la conexión). Solo el **gateway** es accesible desde fuera; el resto se alcanza a través de él.

| Carpeta | Servicio | Tecnología | Puerto | Base de datos | Responsabilidad |
|---|---|---|---|---|---|
| [gateway/](gateway/) | gateway | ASP.NET Core 10 + YARP 2.3 | 8080 | — | Enrutamiento `/api/*` y `/hubs/*`, validación de JWT, CORS, límites de peticiones (general 300/min, login 10/min, OAuth 30/min por IP) |
| [auth/](auth/) | auth-service | NestJS 11 + TypeORM | 3000 | PostgreSQL `climguard_auth` | Login local, OAuth 2.0/OIDC (Google, GitHub), emisión de JWT, usuarios y roles |
| [community/](community/) | community-service | ASP.NET Core 10 + EF Core | 8080 | PostgreSQL `climguard_community` | Comunidades |
| [sensor/](sensor/) | sensor-service | ASP.NET Core 10 + EF Core + SignalR | 8080 | SQL Server `ClimGuardSensor` | Sensores, lecturas, estadísticas, simulador, hub en tiempo real `/hubs/monitoreo` |
| [alert/](alert/) | alert-service | Java 21 + Spring Boot 3.4 + Hibernate | 8080 | PostgreSQL `climguard_alert` | Reglas, evaluación de lecturas, alertas, eventos, niveles y tipos de fenómeno |
| [report/](report/) | report-service | Python 3.12 + FastAPI + Jinja2 + WeasyPrint | 8000 | MongoDB `climguard_reports` (GridFS) | Generación, historial y descarga de reportes PDF; indicadores del panel |
| [audit/](audit/) | audit-service | Python 3.12 + FastAPI | 8000 | MongoDB `climguard_audit` | Registro y consulta de la bitácora |

## Comunicación entre servicios
- El navegador y el ESP8266 llaman al gateway con `Authorization: Bearer <JWT>`; el gateway reenvía el token y cada servicio lo valida de nuevo (misma clave, emisor y audiencia).
- Llamadas internas con la cabecera `X-Internal-Key` (clave compartida entre servicios): el sensor-service pide a alert-service evaluar cada lectura (`POST /api/alerts/evaluate`) y auth, community y alert envían eventos a audit-service (`POST /api/audit`).
- report-service consulta community, sensor, alert y audit **con el JWT del usuario que pidió el reporte**, de modo que cada reporte respeta los permisos de esa persona.
- Cada base de datos solo es accesible por su servicio (redes separadas en Docker Compose; Services `ClusterIP` en K3s).

## Pruebas por servicio
| Servicio | Pruebas |
|---|---|
| auth | `test/common.test.ts`, `test/oauth.test.ts` (node:test) |
| alert | `RuleEvaluatorSelfTest` (evaluador de reglas, sin Spring) |
| report | `tests/` (unittest) y `bench/` (mediciones de PDF) |
| audit | `tests/` (unittest) |
| gateway, community, sensor | compilación (`dotnet build`) en la integración continua; sin pruebas unitarias propias |

Contratos de la API: [docs/DOC-12-API.md](../docs/DOC-12-API.md). Arquitectura: [docs/DOC-13](../docs/DOC-13-Arquitectura%20de%20Software.md).
