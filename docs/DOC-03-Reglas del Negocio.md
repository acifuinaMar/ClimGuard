# ClimGuard
## Reglas de Negocio

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Reglas de Negocio |
| Código | DOC-03 |
| Versión | 1.0 |
| Estado | Finalizado |
| Fecha | Agosto 2026 |

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

---

## RN-013 – Clasificación de alertas

Cada alerta deberá clasificarse en uno de los niveles de alerta definidos por el sistema (Verde, Amarillo, Naranja o Rojo).

---
## RN-014 - Niveles de alerta
Los niveles de alerta y los tipos de fenómeno corresponden a catálogos del sistema y únicamente podrán modificarse mediante cambios en la base de datos.
---

## RN-015 – Registro histórico

Toda alerta generada deberá almacenarse automáticamente en la base de datos para su posterior consulta.

---

# 7. Gestión de Configuración

## RN-016 – Configuración de umbrales

Cada variable climática monitoreada deberá tener al menos un umbral de evaluación configurado.

---

## RN-017 – Modificación de umbrales

Únicamente los usuarios con rol Administrador podrán modificar los umbrales utilizados para la generación automática de alertas.

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