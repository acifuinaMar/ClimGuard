# ClimGuard
## Sistema Web de Monitoreo y Alerta Temprana para Riesgos Climáticos

**Curso:** Desarrollo Web  
**Tecnologías:** Angular 22, .NET 10 (gateway, community, sensor), NestJS (auth), Spring Boot (alert), FastAPI (report, audit), PostgreSQL 16, SQL Server 2022, MongoDB 7, SignalR, Docker Compose, Kubernetes (K3s)  
**Versión:** 2.0 (vigente, ClimGuard 4.1)

---

# DOC-00. Convenciones de la Documentación

### Historial de versiones
| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | Agosto 2026 | Códigos de artefactos y abreviaturas de diagramas. |
| 2.0 | Noviembre 2026 | Estado y vigencia de los documentos, historial de versiones, ubicación de la documentación histórica y abreviaturas de la arquitectura de microservicios. |


Este documento establece las convenciones utilizadas para la elaboración de la documentación técnica y funcional del proyecto **ClimGuard**. Su propósito es mantener una nomenclatura uniforme que facilite la identificación, trazabilidad y consulta de los diferentes artefactos generados durante el desarrollo del sistema.

## Convenciones

| Código | Descripción |
|---------|-------------|
| RF | Requerimiento Funcional |
| RNF | Requerimiento No Funcional |
| RN | Regla de Negocio |
| HU | Historia de Usuario |
| CU | Caso de Uso |
| DS | Diagrama de Secuencia |
| DA | Diagrama de Actividades |
| DC | Diagrama de Clases |
| DER | Diagrama Entidad–Relación |
| API | Endpoint de la API REST |

## Convenciones de Diagramas

| Abreviatura | Significado |
|--------------|------------|
| UI | Interfaz de Usuario |
| API | Backend: API Gateway o microservicio que atiende la petición |
| DB | Base de Datos |
| WS | SignalR |
| GW | API Gateway (YARP) |
| MS | Microservicio (auth, community, sensor, alert, report, audit) |
| K8s | Kubernetes (K3s) |

## Estado y vigencia de los documentos

| Estado | Significado |
|---|---|
| Vigente (ClimGuard 4.1) | Describe la versión en producción. Debe mantenerse al día con cada cambio del sistema. |
| Histórico | Registra cómo era el sistema en una fase anterior. No se modifica salvo para corregir enlaces o retirar información sensible; lleva un aviso al inicio. |

- Los documentos vigentes están en `docs/`; los históricos, en `docs/fases/<fase>/`. El índice general es `docs/README.md`.
- Todo documento vigente incluye una tabla **Historial de versiones** (versión, fecha y cambios). Al actualizarlo no se borra lo que el sistema fue: se indica qué cambió y en qué versión.
- Cuando un elemento del análisis original fue reemplazado (por ejemplo, los *umbrales* por las *reglas de alerta*), se conserva el código original y se anota el elemento que lo reemplaza.
- Ningún documento incluye contraseñas, claves, tokens ni datos de conexión de los servidores.
