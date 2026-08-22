# ClimGuard
## Historias de Usuario

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Historias de Usuario |
| Código | DOC-04 |
| Versión | 1.0 |
| Estado | Finalizado |

---

# Tabla de Contenido

1. Objetivo
2. Historias de Usuario

---

# 1. Objetivo

El presente documento describe las historias de usuario implementadas en ClimGuard. Cada historia representa una necesidad del usuario expresada desde su perspectiva y mantiene trazabilidad con los requerimientos funcionales, casos de uso y componentes desarrollados durante la implementación del sistema.

---

# 2. Historias de Usuario

---

## HU-001 – Acceder al sistema

**Como** usuario registrado

**Quiero** iniciar sesión en el sistema

**Para** acceder a las funcionalidades autorizadas según mi rol.

**Requerimientos relacionados**

- AUT-RF-001
- AUT-RF-002

**Prioridad**

Alta

**Criterios de aceptación**

- El usuario podrá autenticarse mediante credenciales válidas.
- El sistema identificará el rol del usuario.
- El sistema mostrará únicamente las funcionalidades permitidas.

**Valor de negocio**

Garantiza el acceso seguro al sistema y la protección de la información.

---

## HU-002 – Administrar comunidades

**Como** Administrador

**Quiero** gestionar las comunidades registradas

**Para** mantener actualizado el catálogo de comunidades monitoreadas.

**Requerimientos relacionados**

- COM-RF-001
- COM-RF-002

**Prioridad**

Alta

**Criterios de aceptación**

- El administrador podrá registrar comunidades.
- El administrador podrá modificar la información de una comunidad.
- El administrador podrá eliminar comunidades.
- El administrador podrá asociar sensores a una comunidad.

**Valor de negocio**

Permite organizar correctamente las comunidades que serán monitoreadas.

---

## HU-003 – Administrar sensores

**Como** Administrador

**Quiero** gestionar los sensores del sistema

**Para** controlar los dispositivos utilizados en el monitoreo climático.

**Requerimientos relacionados**

- SEN-RF-001
- SEN-RF-002

**Prioridad**

Alta

**Criterios de aceptación**

- El administrador podrá registrar sensores.
- El administrador podrá modificar sensores.
- El administrador podrá activar o desactivar sensores.
- Cada sensor deberá estar asociado a una comunidad.

**Valor de negocio**

Garantiza la correcta administración de los dispositivos de monitoreo.

---

## HU-004 – Consultar usuarios

**Como** Administrador

**Quiero** consultar la información de los usuarios registrados.

**Para** verificar los usuarios con acceso al sistema.

**Requerimientos relacionados**

- USR-RF-001

**Prioridad**

Alta

**Criterios de aceptación**

- El administrador podrá consultar los usuarios.
- El sistema mostrará el rol de cada usuario.

**Nota**

La creación de usuarios será responsabilidad del DBA y no forma parte del alcance del sistema.

---

## HU-005 – Configurar umbrales

**Como** Administrador

**Quiero** configurar los umbrales de las variables climáticas

**Para** definir cuándo debe generarse una alerta.

**Requerimientos relacionados**

- CFG-RF-001

**Prioridad**

Alta

**Criterios de aceptación**

- El administrador podrá configurar los umbrales.
- Los cambios deberán aplicarse a futuras lecturas.
- Solo usuarios autorizados podrán modificar los umbrales (administrador).

**Valor de negocio**

Permite adaptar el sistema a las condiciones de cada comunidad.

---

## HU-006 – Monitorear variables climáticas

**Como** Operador

**Quiero** visualizar las variables climáticas en tiempo real

**Para** supervisar el estado ambiental de las comunidades.

**Requerimientos relacionados**

- MON-RF-001
- MON-RF-002
- MON-RF-003
- DAS-RF-001
- DAS-RF-002
- DAS-RF-003

**Prioridad**

Alta

**Criterios de aceptación**

- Las lecturas deberán actualizarse automáticamente.
- El sistema mostrará el estado de los sensores.
- El dashboard presentará indicadores actualizados.

**Valor de negocio**

Facilita el monitoreo continuo de las condiciones climáticas.

---

## HU-007 – Recibir alertas

**Como** operador

**Quiero** recibir alertas cuando exista una condición de riesgo

**Para** reaccionar oportunamente ante posibles emergencias.

**Requerimientos relacionados**

- ALT-RF-001
- ALT-RF-002
- ALT-RF-003

**Prioridad**

Alta

**Criterios de aceptación**

- El sistema generará alertas automáticamente.
- Las alertas mostrarán su nivel de peligro.
- Las alertas serán notificadas al usuario.

**Valor de negocio**

Reduce el tiempo de respuesta ante eventos climáticos.

**Nota**
Las alertas serán notificadas en tiempo real mediante SignalR.

---

## HU-008 – Visualizar alertas activas

**Como** Operador

**Quiero** consultar el detalle de las alertas generadas

**Para** analizar las condiciones detectadas.

**Requerimientos relacionados**

- ALT-RF-004

**Prioridad**

Media

**Criterios de aceptación**

- El sistema mostrará la información detallada de cada alerta.

**Valor de negocio**

Facilita la evaluación de las situaciones de riesgo.

---

## HU-009– Consultar bitácora

**Como** Administrador

**Quiero** consultar la bitácora del sistema

**Para** auditar las acciones realizadas por los usuarios.

**Requerimientos relacionados**

- USR-RF-003

**Prioridad**

Media

**Criterios de aceptación**

- El administrador podrá consultar la bitácora.
- El sistema mostrará el usuario, fecha, hora y acción realizada.
- Solo el administrador podrá acceder a este módulo.

**Valor de negocio**

Facilita la auditoría y trazabilidad de las acciones administrativas.