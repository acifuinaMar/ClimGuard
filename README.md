# ClimGuard 4.1

**Sistema web de monitoreo y alerta temprana de riesgos climáticos para comunidades vulnerables.**

Proyecto académico del curso de Desarrollo Web (Universidad Mariano Gálvez). ClimGuard recibe lecturas de sensores físicos (ESP8266) y simulados, evalúa reglas de alerta, notifica en tiempo real y genera reportes PDF. Está construido como un conjunto de microservicios detrás de un API Gateway y se ejecuta en producción sobre Kubernetes (K3s).

- **Producción:** <https://climguard.acifuina.online>
- **Versión estable:** etiqueta [`v4.1.0`](https://github.com/acifuinaMar/ClimGuard/tree/v4.1.0) (frontend 4.1.0, backend 4.0.0)
- **Documentación completa:** [docs/README.md](docs/README.md)

---

## Funcionalidades

| Área | Qué permite |
|---|---|
| Acceso | Inicio de sesión con usuario y contraseña, o con **Google** (OIDC) y **GitHub** (OAuth 2.0); vinculación de cuentas externas; roles Administrador, Operador y Consulta. |
| Monitoreo | Panel en tiempo real (SignalR) con el estado de cada sensor, alertas activas y gráfica de evolución; mapa de comunidades y sensores por nivel de alerta; alarma visual y sonora ante emergencias. |
| Sensores | Alta, edición y activación/desactivación; origen **Físico** (lecturas enviadas por el dispositivo) o **Simulado** (lecturas generadas por el sistema); comunidad elegida de una lista. |
| Comunidades | Registro con coordenadas; país, y para Guatemala **departamento y municipio en cascada** (22 departamentos, 340 municipios). |
| Reglas y alertas | Reglas por tipo de sensor con intervalo de peligro `[mínimo, máximo]`, nivel y fenómeno; generación automática de alertas; atención de alertas; historial de eventos con filtros; catálogo de tipos de fenómeno. |
| Reportes | 8 tipos de reporte PDF (comunidades, sensores, lecturas, alertas, historial de eventos, estado de sensores, estadísticas climáticas y ejecutivo) con filtros, historial y descarga. |
| Administración | Gestión de usuarios y roles; bitácora de auditoría de todas las acciones. |

## Arquitectura

```text
Navegador ──HTTPS──► nginx (host, Let's Encrypt) ──► Traefik (Ingress K3s, TLS)
                                                     ├─ /            ► frontend            Angular 22 (nginx)
                                                     └─ /api, /hubs  ► gateway             .NET 10 · YARP (JWT, CORS, límites)
                                                                         ├─ auth-service       NestJS 11 · PostgreSQL
                                                                         ├─ community-service  .NET 10 · PostgreSQL
                                                                         ├─ sensor-service     .NET 10 · SQL Server · SignalR · simulador
                                                                         ├─ alert-service      Java 21 · Spring Boot 3.4 · PostgreSQL
                                                                         ├─ report-service     Python 3.12 · FastAPI · MongoDB/GridFS · WeasyPrint
                                                                         └─ audit-service      Python 3.12 · FastAPI · MongoDB
ESP8266 ──HTTPS── POST /api/auth/login → POST /api/readings
```

- Cada microservicio tiene su propia base de datos; se comunican solo por HTTP (con el JWT del usuario o una clave interna).
- El JWT lo emite el auth-service (también tras el login con Google o GitHub) y lo validan el gateway y cada servicio.
- En K3s las bases de datos son StatefulSets con volúmenes persistentes; la configuración va en ConfigMaps y los secretos en Secrets.

Detalle: [DOC-13 Arquitectura de Software](docs/DOC-13-Arquitectura%20de%20Software.md).

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | Angular 22, TypeScript 6, SignalR, Leaflet |
| API Gateway | ASP.NET Core 10 + YARP 2.3 |
| Microservicios | NestJS 11 + TypeORM (auth) · ASP.NET Core 10 + EF Core (community, sensor) · Spring Boot 3.4 + Hibernate (alert) · FastAPI (report, audit) |
| Datos | PostgreSQL 16 · SQL Server 2022 · MongoDB 7 (GridFS para PDF) |
| Seguridad | JWT HS256, OAuth 2.0 / OIDC (Google, GitHub) con PKCE, HTTPS, RBAC por permisos |
| Infraestructura | Docker / Docker Compose (local) · K3s + Traefik (producción) · Let's Encrypt |
| Dispositivo | ESP8266 (firmware fuera de este repositorio) |

## Estructura del repositorio

```text
ClimGuard/
├── README.md                 este archivo
├── docs/                     documentación (índice en docs/README.md)
│   ├── DOC-00 … DOC-15       análisis, diseño, API, arquitectura y manuales
│   ├── MIGRACIONES.md · pruebas.md · riesgos-y-pendientes.md
│   └── fases/                documentación histórica de cada fase
├── frontend/climguard-web/   aplicación Angular
├── services/                 microservicios: gateway, auth, community, sensor, alert, report, audit
├── docker/postgres/          inicialización de PostgreSQL (bases y usuarios por servicio)
├── nginx/                    configuración del borde HTTPS para Docker Compose
├── k8s/                      manifiestos de producción (generados) y guía de operación
├── scripts/                  generación de .env, certificados y manifiestos; migraciones SQL; respaldo y recuperación
├── docker-compose.yml        stack completo para desarrollo local
├── docker-compose.oauth.yml  salida a Internet solo para el auth-service (OAuth)
└── .github/workflows/        integración continua (pruebas y builds)
```

Más detalle por carpeta: [services/README.md](services/README.md) y [frontend/climguard-web/README.md](frontend/climguard-web/README.md).

## Ejecución local (Docker Compose)

Requisitos: Docker con Compose v2, Bash (Linux, macOS o Git Bash en Windows), OpenSSL, unos 6 GB de RAM libres.

```bash
git clone https://github.com/acifuinaMar/ClimGuard.git && cd ClimGuard
./scripts/gen-env.sh          # crea .env con secretos aleatorios (nunca se versiona)
./scripts/gen-certs.sh        # certificado autofirmado para https://localhost:8443
docker compose up --build     # primer arranque: varios minutos (SQL Server, Maven, npm, NuGet)
```

- Aplicación: <https://localhost:8443> (el navegador advertirá del certificado autofirmado).
- Usuarios iniciales: con `SEED_DEFAULT_USERS=true` en `.env` se crean usuarios de demostración **solo para desarrollo local**; nunca active esa opción en producción.
- Login con Google o GitHub en local: complete las variables `OAUTH_*`, `GOOGLE_*` y `GITHUB_*` del `.env` y use `docker compose -f docker-compose.yml -f docker-compose.oauth.yml up --build` (ver [DOC-15 §6](docs/DOC-15-Manual%20t%C3%A9cnico.md)).
- Detener sin perder datos: `docker compose down` (**no** use `-v`, que borra los volúmenes).

Producción (K3s): [k8s/README.md](k8s/README.md) y [DOC-15 Manual técnico](docs/DOC-15-Manual%20t%C3%A9cnico.md).

## Pruebas

| Componente | Comando | Resultado de referencia (v4.1) |
|---|---|---|
| Frontend | `cd frontend/climguard-web && npx ng test --watch=false --browsers=ChromeHeadless` | 40 / 40 |
| Report | `cd services/report && python -m unittest discover -s tests -t .` | 68 / 68 |
| Audit | `cd services/audit && python -m unittest discover -s tests -t .` | 4 / 4 |
| Auth + OAuth | `bash scripts/test-all.sh` (incluye los demás) | 41 / 41 |
| Alert (evaluador de reglas) | incluido en `scripts/test-all.sh` | 48 comprobaciones |

La integración continua de GitHub Actions ejecuta estas pruebas, los builds de todos los servicios y del frontend, valida Compose y los manifiestos de Kubernetes y busca secretos en cada cambio. Detalle: [docs/pruebas.md](docs/pruebas.md).

## Documentación

Índice completo: **[docs/README.md](docs/README.md)**. Accesos directos:
[Manual de usuario](docs/DOC-14-Manual%20de%20usuario.md) ·
[Manual técnico](docs/DOC-15-Manual%20t%C3%A9cnico.md) ·
[API](docs/DOC-12-API.md) ·
[Arquitectura](docs/DOC-13-Arquitectura%20de%20Software.md) ·
[Operación en K3s](k8s/README.md) ·
[Historia por fases](docs/README.md#historia-del-proyecto)

## Evolución

| Fase | Resumen | Referencia |
|---|---|---|
| 1-2 | Monolito ASP.NET Core + SQL Server + Angular, simulación de lecturas y SignalR | [docs/fases/fase-1-2](docs/fases/fase-1-2/README.md) · etiqueta `fase2-main-final` |
| 3 | Microservicios con API Gateway, PostgreSQL/SQL Server/MongoDB, reportes PDF, auditoría; Docker Compose | [docs/fases/fase-3](docs/fases/fase-3/README.md) |
| 4 / 4.1 | OAuth 2.0/OIDC (Google, GitHub), despliegue en K3s con migración de datos, desplegables de comunidad y departamento/municipio | [docs/fases/fase-4](docs/README.md#fase-4) · etiqueta `v4.1.0` |

---

# Declaración de uso de inteligencia artificial

En el desarrollo de este proyecto el equipo utilizó herramientas de IA generativa como **asistentes**. Las decisiones de diseño, la revisión del código y la aprobación de cada cambio fueron responsabilidad del equipo.

| Herramienta | Uso |
|---|---|
| **ChatGPT** (OpenAI) | Apoyo de consulta: análisis de requerimientos, revisión de decisiones técnicas, orientación sobre OAuth 2.0/OIDC y K3s, interpretación de diagnósticos, planificación de la integración y del despliegue, y apoyo en la redacción de documentación. No ejecutó comandos ni pruebas. |
| **Claude Code** (Anthropic) | En la Fase 4 y 4.1, bajo instrucciones y aprobación del equipo en cada etapa: diagnóstico de la VPS, generador de manifiestos Kubernetes (`scripts/gen-k8s.py`) y scripts de secretos, restauración y recuperación (`scripts/k8s-*.sh`, `scripts/rollback-fase3.sh`); ejecución del despliegue en K3s y de la migración de datos; integración de ramas, corrección de pruebas y ejecución de suites y builds; reorganización de la documentación, manuales y configuración de CI. Los commits en los que participó lo declaran con `Co-Authored-By: Claude`. |

Lo que hizo el equipo y no las herramientas de IA:
- Las pruebas funcionales en el navegador (inicio de sesión local, Google y GitHub, panel, sensores ESP8266 físicos y simulados, formularios).
- La configuración de las aplicaciones OAuth en Google Cloud y GitHub, y el registro de sus credenciales.
- La clasificación de los sensores como *Físico* o *Simulado* y la aprobación de cada despliegue.

Sobre credenciales: no se escribieron en las conversaciones. Claude Code ejecutó en la VPS los scripts que crean los Secrets de Kubernetes, diseñados para no imprimir valores. Una excepción quedó documentada en [K3S_PROGRESS.md](docs/fases/fase-4/K3S_PROGRESS.md): una contraseña de un despliegue anterior apareció en una salida y se eliminó junto con ese despliegue. El código y la documentación generados con ayuda de IA fueron revisados por el equipo antes de incorporarlos.

---

## Equipo de desarrollo

- **Dalila Nineth Zacarías de León**
- **Mahuerk Yoc Vázquez**
- **Maryori Elizabeth Acifuina Juárez**

## Licencia

Proyecto desarrollado con fines académicos para el curso de **Desarrollo Web**.
