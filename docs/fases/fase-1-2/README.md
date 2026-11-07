# ClimGuard — Fases 1 y 2 (monolito .NET)

> **Documento histórico.** Resume cómo era ClimGuard antes de la arquitectura de microservicios. El código de estas fases **ya no está en el árbol actual** del repositorio; se conserva en el historial de Git. Documentación vigente de ClimGuard 4.1: [docs/README.md](../../README.md).

## Qué había
| Componente | Tecnología | Ubicación en las etiquetas históricas |
|---|---|---|
| Frontend | Angular 20 | `frontend/climguard-web/` (evolucionó hasta la versión actual) |
| Esqueleto inicial (Fase 1) | ASP.NET Core con capas Api/Application/Domain/Infrastructure (plantilla, `WeatherForecastController`) | `backend/` |
| API monolítica (Fase 2) | ASP.NET Core 10 Web API, CQRS (Commands/Queries), Repository, Entity Framework Core | `ClimGuard Backend/` |
| Base de datos | SQL Server 2022, scripts `QueryMain.sql` y `QueryMain_P2.sql` | `ClimGuard Backend/Script para DB/` |
| Simulación | `BackgroundService` que generaba lecturas para todos los sensores activos | `ClimGuard Backend/Infraestructure/BackgroudService/` |
| Tiempo real | SignalR | dentro del monolito |
| Despliegue | Docker Compose (`sqlserver`, `db-init`, `api`, `frontend`) | `docker-compose.phase2.yml` |
| Pruebas | xUnit del dominio (`UmbralTests`) | `tests/ClimGuard.Domain.Tests/` |

Controladores de la API de la Fase 2: Alerta, Bitacora, Comunidad, EstadoSensor, LecturaSensor, Login, NivelAlerta, ReglaAlerta, Sensor, TipoFenomeno y Usuario.
El módulo **Umbral** (umbrales por tipo de sensor) existió en la Fase 2 y fue reemplazado por las **reglas de alerta** del alert-service a partir de la Fase 3.

## Cómo consultar ese código
```bash
git show fase2-main-final:README.md                    # README de main antes de la Fase 4
git ls-tree -r --name-only v4.1.0 -- "ClimGuard Backend" backend tests
git switch --detach v4.1.0                             # árbol completo con el código heredado (solo lectura)
```
- `fase2-main-final`: estado de `main` antes de integrar la Fase 4 (incluye el módulo Umbral).
- `v4.1.0`: última versión que aún contiene `ClimGuard Backend/`, `backend/` y `tests/` en el árbol.

## Documentación de esa etapa
- [api-docx/](api-docx/): documentación de endpoints de la Fase 2 en Word (Alertas, Comunidad, Sensor, Usuario). Las rutas que describe (`/api/Comunidad`, `/api/Sensor`, …) **no existen en ClimGuard 4.1**; la API vigente está en [DOC-12](../../DOC-12-API.md).
- Los documentos `DOC-00` a `DOC-15` nacieron en estas fases; su historial de versiones indica qué cambió después.

## Advertencia de seguridad
Los `appsettings.json` del monolito contenían credenciales en claro (contraseña `sa` y clave JWT de la Fase 2). Ya no están en el árbol, pero **siguen en el historial público de Git**. Esas credenciales pertenecen a un despliegue que fue eliminado; no deben reutilizarse en ningún entorno.
