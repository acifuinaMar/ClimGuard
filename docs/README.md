# Documentación de ClimGuard 4.1

Esta carpeta separa la **documentación vigente** (describe la versión 4.1 en producción) de la **documentación histórica** (registra cómo era el sistema en cada fase). Si un documento histórico contradice a uno vigente, manda el vigente.

← Volver al [README principal](../README.md)

## Documentación vigente

### Análisis
| Código | Documento | Contenido |
|---|---|---|
| DOC-00 | [Estándar de documentación](DOC-00-Estandar%20de%20Documentacion.md) | Convenciones, versiones y estructura de los documentos |
| DOC-01 | [Introducción](DOC-01-Introduccion.md) | Problema, objetivos y alcance |
| DOC-02 | [Requerimientos](DOC-02-Requerimientos.md) | Requerimientos funcionales y no funcionales |
| DOC-03 | [Reglas del negocio](DOC-03-Reglas%20del%20Negocio.md) | Reglas que gobiernan sensores, alertas, acceso y reportes |
| DOC-04 | [Historias de usuario](DOC-04-Historias%20de%20usuario.md) | Historias por rol |
| DOC-05 | [Casos de uso](DOC-05-Casos%20de%20uso.md) | Especificación de casos de uso |

### Diseño
| Código | Documento | Contenido |
|---|---|---|
| DOC-06 | [Diagrama de casos de uso general](DOC-06-Diagrama%20de%20casos%20de%20uso%20general.md) | Actores y casos de uso |
| DOC-07 | [Diagramas de actividades](DOC-07-Diagramas%20de%20Actividades.md) | Flujos de los procesos principales |
| DOC-08 | [Diagramas de secuencia](DOC-08-Diagramas%20de%20secuencia.md) | Interacción entre componentes |
| DOC-09 | [Diagrama de clases](DOC-09-Diagrama%20de%20clases.md) | Modelo de clases por servicio |
| DOC-10 | [Modelo de base de datos](DOC-10-Modelo%20de%20BD.md) | Bases de datos por servicio |
| DOC-11 | [Diagrama entidad-relación](DOC-11%20Diagrama%20Entidad-Relaci%C3%B3n.md) | Entidades y relaciones |
| DOC-12 | [API](DOC-12-API.md) | Endpoints verificados contra el código de cada servicio |
| DOC-13 | [Arquitectura de software](DOC-13-Arquitectura%20de%20Software.md) | Microservicios, seguridad, tiempo real y despliegue |

### Manuales y operación
| Documento | Para quién |
|---|---|
| [DOC-14 Manual de usuario](DOC-14-Manual%20de%20usuario.md) | Personas que usan el sistema (por rol) |
| [DOC-15 Manual técnico](DOC-15-Manual%20t%C3%A9cnico.md) | Quien instala, configura, opera o recupera el sistema |
| [Operación en K3s](../k8s/README.md) | Comandos de verificación, reinicio, secretos, respaldo y recuperación en producción |
| [Migraciones SQL](MIGRACIONES.md) | Scripts de base de datos y su estado en producción |
| [Pruebas](pruebas.md) | Suites automáticas, CI y pruebas funcionales de la versión 4.1 |
| [Riesgos y pendientes](riesgos-y-pendientes.md) | Hallazgos de seguridad, operación y funcionalidad pendientes |
| [Microservicios](../services/README.md) · [Frontend](../frontend/climguard-web/README.md) | Guía de cada parte del código |

## Historia del proyecto

Documentos que registran cada fase tal como fue. No se actualizan para reflejar la versión actual.

### Fases 1 y 2
- [README de las Fases 1 y 2](fases/fase-1-2/README.md): monolito ASP.NET Core con SQL Server, cómo consultar ese código en las etiquetas `fase2-main-final` y `v4.1.0`.
- [api-docx/](fases/fase-1-2/api-docx/): documentación de la API de la Fase 2 en Word.

### Fase 3
- [README de la Fase 3](fases/fase-3/README.md): paso a microservicios, estado del código recibido y requisitos.
- [CAMBIOS-REALIZADOS.md](fases/fase-3/CAMBIOS-REALIZADOS.md) · [PRUEBAS.md](fases/fase-3/PRUEBAS.md) · [REVISION-INTEGRACION.md](fases/fase-3/REVISION-INTEGRACION.md) · [RIESGOS-PENDIENTES.md](fases/fase-3/RIESGOS-PENDIENTES.md)
- [DESPLIEGUE-SEGURO.md](fases/fase-3/DESPLIEGUE-SEGURO.md) (despliegue con Docker Compose) · [RECURSOS-VPS.md](fases/fase-3/RECURSOS-VPS.md) (límites de reportes PDF)

### Fase 4
- [FASE4_CAMBIOS.md](fases/fase-4/FASE4_CAMBIOS.md): diseño de OAuth 2.0 / OIDC con Google y GitHub.
- [K3S_PROGRESS.md](fases/fase-4/K3S_PROGRESS.md): bitácora de la migración de Docker Compose a K3s.
- Versión 4.1 (etiqueta `v4.1.0`): integración de los desplegables de comunidad y de departamento/municipio, y corrección de la inicialización de Auth.

## Advertencia de seguridad
Ningún documento contiene valores de secretos. Antes de entregar o desplegar, revise la sección **Seguridad** de [riesgos-y-pendientes.md](riesgos-y-pendientes.md): incluye contraseñas heredadas que deben cambiarse.
