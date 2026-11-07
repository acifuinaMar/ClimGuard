# ClimGuard
## Reglas de Negocio

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Reglas de Negocio |
| Código | DOC-03 |
| Versión | 3.0 |
| Estado | Vigente (ClimGuard 4.1) |
| Fecha | Noviembre 2026 |

### Historial de versiones
| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | Agosto 2026 | Reglas RN-001 a RN-021 de las Fases 1 y 2. |
| 2.0 | Noviembre 2026 (Fase 3) | Semántica de intervalo de las reglas de alerta y origen del sensor. |
| 3.0 | Noviembre 2026 | Códigos definitivos RN-022 y RN-023 para las reglas de la Fase 3; reglas RN-024 a RN-029 de la Fase 4; notas de vigencia en RN-012, RN-014, RN-016 y RN-017. |

---

# Tabla de Contenido

1. Objetivo
2. Gestión de Usuarios
3. Gestión de Comunidades
4. Gestión de Sensores
5. Monitoreo Climático
6. Gestión de Alertas
7. Gestión de Configuración
8. Seguridad
9. Bitácora

---

# 1. Objetivo

El presente documento define las reglas de negocio que regulan el funcionamiento del sistema ClimGuard. Estas reglas representan las políticas, restricciones y condiciones que rigen la operación del sistema y constituyen la base para la implementación de su lógica de negocio.

---

# 2. Gestión de Usuarios

## RN-001 – Rol único por usuario

Cada usuario deberá tener asignado un único rol dentro del sistema.

---

## RN-002 – Acceso según rol

Cada usuario únicamente podrá acceder a las funcionalidades permitidas por el rol que tenga asignado.

## RN-003- Creación de usuarios
La creación de usuarios del sistema será responsabilidad exclusiva del Administrador de la Base de Datos (DBA), por lo que ClimGuard no implementa un proceso de autorregistro de usuarios.

---

# 3. Gestión de Comunidades

## RN-004 – Registro independiente de comunidades

Una comunidad podrá registrarse independientemente de la existencia de sensores asociados.

---

## RN-005 – Identificador único de comunidad

Cada comunidad deberá poseer un identificador único dentro del sistema.

---

# 4. Gestión de Sensores

## RN-006 – Asociación de sensores

Todo sensor deberá estar asociado a una comunidad previamente registrada.

---

## RN-007 – Identificador único de sensor

No podrán existir dos sensores con el mismo identificador.

---
## RN-008 - Tipos de sensor
Los tipos de sensor disponibles en el sistema corresponden a un catálogo administrado por la base de datos y no podrán ser creados ni eliminados desde la aplicación.

---

# 5. Monitoreo Climático

## RN-009 – Asociación de lecturas

Toda lectura registrada deberá asociarse al sensor que la generó.

---

## RN-010 – Variables monitoreadas

Las lecturas recibidas deberán corresponder a variables climáticas previamente configuradas en el sistema.

---

# 6. Gestión de Alertas

## RN-011 – Origen de las alertas

Toda alerta deberá originarse a partir de una lectura registrada.

---

## RN-012 – Generación de alertas

Una alerta únicamente podrá generarse cuando una lectura alcance o supere alguno de los umbrales configurados para el tipo de sensor correspondiente.

> **Estado en ClimGuard 4.1:** los umbrales se implementan como reglas de alerta; una alerta se genera cuando la lectura cae dentro del intervalo de peligro de una regla activa (RN-022).

---

## RN-013 – Clasificación de alertas

Cada alerta deberá clasificarse en uno de los niveles de alerta definidos por el sistema (Verde, Amarillo, Naranja o Rojo).

---
## RN-014 - Niveles de alerta
Los niveles de alerta y los tipos de fenómeno corresponden a catálogos del sistema y únicamente podrán modificarse mediante cambios en la base de datos.

> **Estado en ClimGuard 4.1:** los niveles de alerta siguen siendo un catálogo fijo; los **tipos de fenómeno** se administran desde la interfaz (Administrador y Operador).
---

## RN-015 – Registro histórico

Toda alerta generada deberá almacenarse automáticamente en la base de datos para su posterior consulta.

---

# 7. Gestión de Configuración

## RN-016 – Configuración de umbrales

Cada variable climática monitoreada deberá tener al menos un umbral de evaluación configurado.

> **Estado en ClimGuard 4.1:** se cumple con al menos una regla de alerta activa por tipo de sensor (RN-022).

---

## RN-017 – Modificación de umbrales

Únicamente los usuarios con rol Administrador podrán modificar los umbrales utilizados para la generación automática de alertas.

> **Estado en ClimGuard 4.1:** se aplica a las reglas de alerta: solo el Administrador las crea, edita o convierte.

---

# 8. Seguridad

## RN-018 – Autenticación obligatoria

Todo usuario deberá autenticarse antes de acceder a cualquier funcionalidad del sistema.

---

## RN-019 – Control de acceso

Las funcionalidades disponibles dependerán del rol asignado al usuario autenticado.

---

# 9. Bitácora

## RN-020 – Registro de acciones

Toda acción administrativa realizada dentro del sistema deberá registrarse automáticamente en la bitácora.

---

## RN-021 – Consulta de bitácora

La consulta de la bitácora únicamente podrá ser realizada por usuarios con rol de Administrador.

---

# Relación con los Requerimientos Funcionales

Las reglas aquí descritas complementan los requerimientos funcionales y establecen las condiciones que deben cumplirse durante la ejecución de las funcionalidades implementadas por ClimGuard.
---

## Actualización Fase 3 (noviembre 2026) – semántica de reglas y origen del sensor

**RN-022 – Semántica de las reglas de alerta.** `valorMin` y `valorMax` delimitan el intervalo que **activa** la regla (zona de peligro), con extremos incluidos: la condición se cumple cuando `valor >= valorMin && valor <= valorMax`. Ya no representan el rango normal. Con varias reglas coincidentes se aplica la de **mayor nivel**; a igual nivel, la de menor id. Un valor fuera de todos los intervalos, o un sensor sin reglas para su tipo, no tiene condición de peligro. El enfriamiento (por sensor y regla) solo evita crear una alerta repetida; no elimina la condición de peligro. Las reglas anteriores al cambio se marcan como LEGADAS (`requiereRevision`) y siguen evaluándose con su semántica original (alerta fuera de `[min,max]`) para no dejar el sistema sin alertas; solo pasan a la semántica nueva por una conversión explícita de un administrador (ver `MIGRACIONES.md`).

**RN-023 – Origen del sensor.** Todo sensor es `FISICO` (envía lecturas por HTTP POST `/api/readings`) o `SIMULADO` (el simulador le genera lecturas mientras esté activo y la simulación encendida). El origen es independiente del estado activo/inactivo.

## Reglas incorporadas en la Fase 4 (noviembre 2026)

**RN-024 – Cuentas externas.** Una cuenta de Google o GitHub se identifica por el proveedor y su identificador de usuario en ese proveedor, nunca por el correo. Solo se registra automáticamente si el auto-registro está habilitado, el proveedor confirma un correo verificado y, si se configuró, el dominio del correo está autorizado.

**RN-025 – Rol inicial de las cuentas externas.** Toda cuenta creada por el inicio de sesión externo recibe el rol **Consulta**. Ninguna ruta de inicio de sesión externo asigna los roles Administrador u Operador; el cambio de rol lo hace un Administrador.

**RN-026 – Vinculación de cuentas.** Vincular una cuenta externa a un usuario existente exige una sesión iniciada de ese usuario. Una cuenta externa solo puede estar vinculada a un usuario.

**RN-027 – Lecturas de dispositivos.** Solo un usuario con rol Operador o Administrador puede registrar lecturas por la API. Los dispositivos físicos usan una cuenta de servicio con rol Operador.

**RN-028 – Eliminación de comunidades.** No se puede eliminar una comunidad que tenga sensores asociados.

**RN-029 – Reportes.** Generar, consultar el historial y descargar reportes es exclusivo del Administrador. Un reporte que supere el máximo de filas configurado no se genera: se informa el límite y el total para que se acoten los filtros.
