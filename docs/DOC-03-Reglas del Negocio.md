# ClimGuard
## Reglas de Negocio

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Reglas de Negocio |
| Código | DOC-03 |
| Versión | 1.0 |
| Estado | En desarrollo |
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

El presente documento define las reglas de negocio que regulan el funcionamiento del sistema ClimGuard. Estas reglas representan las políticas, restricciones y condiciones que deberán cumplirse durante la operación del sistema, independientemente de la tecnología utilizada para su implementación.

---

# 2. Gestión de Usuarios

## RN-001 – Rol único por usuario

Cada usuario deberá tener asignado un único rol dentro del sistema.

---

## RN-002 – Acceso según rol

Cada usuario únicamente podrá acceder a las funcionalidades permitidas por el rol que tenga asignado.

---

# 3. Gestión de Comunidades

## RN-003 – Registro independiente de comunidades

Una comunidad podrá registrarse independientemente de la existencia de sensores asociados.

---

## RN-004 – Identificador único de comunidad

Cada comunidad deberá poseer un identificador único dentro del sistema.

---

# 4. Gestión de Sensores

## RN-005 – Asociación obligatoria

Todo sensor deberá estar asociado a una única comunidad.

---

## RN-006 – Identificador único de sensor

No podrán existir dos sensores con el mismo identificador.

---

## RN-007 – Estado operativo

Un sensor inactivo no deberá generar nuevas lecturas.

---

# 5. Monitoreo Climático

## RN-008 – Asociación de lecturas

Toda lectura registrada deberá asociarse al sensor que la generó.

---

## RN-009 – Variables monitoreadas

Las lecturas recibidas deberán corresponder a variables climáticas previamente configuradas en el sistema.

---

# 6. Gestión de Alertas

## RN-010 – Origen de las alertas

Toda alerta deberá originarse a partir de una lectura registrada.

---

## RN-011 – Generación de alertas

Una alerta únicamente podrá generarse cuando una lectura supere el umbral configurado para la variable correspondiente.

---

## RN-012 – Clasificación de alertas

Cada alerta deberá clasificarse en un único nivel de peligro.

---

## RN-013 – Registro histórico

Toda alerta generada deberá registrarse automáticamente en el historial de eventos.

---

# 7. Gestión de Configuración

## RN-014 – Configuración de umbrales

Cada variable climática monitoreada deberá tener al menos un umbral de evaluación configurado.

---

## RN-015 – Modificación de umbrales

Únicamente los usuarios autorizados podrán modificar los umbrales utilizados para la generación de alertas.

---

# 8. Seguridad

## RN-016 – Autenticación obligatoria

Todo usuario deberá autenticarse antes de acceder a cualquier funcionalidad del sistema.

---

## RN-017 – Control de acceso

Las funcionalidades disponibles dependerán del rol asignado al usuario autenticado.

---

# 9. Bitácora

## RN-018 – Registro de acciones

Toda acción administrativa realizada dentro del sistema deberá registrarse automáticamente en la bitácora.

---

## RN-019 – Consulta de bitácora

La consulta de la bitácora únicamente podrá ser realizada por usuarios con rol de Administrador.

---

# Relación con los Requerimientos Funcionales

Las reglas de negocio complementan los requerimientos funcionales definidos en el documento **DOC-02 – Especificación de Requerimientos**, estableciendo las condiciones bajo las cuales deberán ejecutarse las funcionalidades del sistema.

Las reglas aquí descritas deberán ser consideradas durante el diseño de la base de datos, la implementación de la lógica de negocio y la construcción de los casos de uso e historias de usuario.