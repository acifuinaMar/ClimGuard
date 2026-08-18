# ClimGuard
## Historias de Usuario

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Historias de Usuario |
| Código | DOC-04 |
| Versión | 1.0 |
| Estado | En desarrollo |

---

# Tabla de Contenido

1. Objetivo
2. Historias de Usuario

---

# 1. Objetivo

El presente documento describe las historias de usuario del sistema ClimGuard. Cada historia representa una necesidad del usuario expresada desde su perspectiva y servirá como base para la elaboración de los casos de uso, diagramas de secuencia y planificación del desarrollo.

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

## HU-004 – Administrar usuarios

**Como** Administrador

**Quiero** gestionar los usuarios del sistema

**Para** controlar quién puede acceder a la plataforma.

**Requerimientos relacionados**

- USR-RF-001
- USR-RF-002

**Prioridad**

Alta

**Criterios de aceptación**

- El administrador podrá registrar usuarios.
- El administrador podrá modificar usuarios.
- El administrador podrá desactivar usuarios.
- El administrador podrá asignar roles.

**Valor de negocio**

Permite mantener un control adecuado sobre el acceso al sistema.

---

## HU-005 – Configurar umbrales

**Como** Operador

**Quiero** configurar los umbrales de las variables climáticas

**Para** definir cuándo debe generarse una alerta.

**Requerimientos relacionados**

- CFG-RF-001

**Prioridad**

Alta

**Criterios de aceptación**

- El operador podrá configurar los umbrales.
- Los cambios deberán aplicarse a futuras lecturas.
- Solo usuarios autorizados podrán modificar los umbrales.

**Valor de negocio**

Permite adaptar el sistema a las condiciones de cada comunidad.

---

## HU-006 – Monitorear variables climáticas

**Como** Operador o Usuario de Monitoreo

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

**Como** Usuario de Monitoreo

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

---

## HU-008 – Consultar alertas

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

## HU-009 – Consultar historial

**Como** Operador

**Quiero** consultar el historial de eventos

**Para** analizar eventos ocurridos anteriormente.

**Requerimientos relacionados**

- HIS-RF-001
- HIS-RF-002
- HIS-RF-003

**Prioridad**

Media

**Criterios de aceptación**

- El sistema mostrará el historial registrado.
- El usuario podrá consultar el detalle de cada evento.

**Valor de negocio**

Permite realizar seguimiento y análisis histórico de los eventos registrados.

---

## HU-010 – Consultar bitácora

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

**Valor de negocio**

Facilita la auditoría y trazabilidad de las acciones administrativas.

---

## HU-011 – Reiniciar monitoreo

**Como** Administrador

**Quiero** reiniciar el proceso de monitoreo

**Para** restablecer el funcionamiento del sistema cuando sea necesario.

**Requerimientos relacionados**

- CFG-RF-002
- CFG-RF-003

**Prioridad**

Media

**Criterios de aceptación**

- El administrador podrá reiniciar el monitoreo.
- El sistema continuará operando correctamente después del reinicio.

**Valor de negocio**

Permite recuperar rápidamente la operación del sistema.

---

## HU-012 – Recuperar contraseña

**Como** usuario registrado

**Quiero** solicitar la recuperación de mi contraseña

**Para** volver a acceder al sistema cuando la haya olvidado.

**Requerimientos relacionados**

- AUT-RF-003

**Prioridad**

Alta

**Criterios de aceptación**

- El usuario podrá solicitar la recuperación.
- El sistema iniciará el proceso de validación correspondiente.

**Valor de negocio**

Reduce la dependencia del administrador para recuperar accesos.

---

## HU-013 – Restablecer contraseña

**Como** usuario registrado

**Quiero** establecer una nueva contraseña

**Para** recuperar el acceso a mi cuenta.

**Requerimientos relacionados**

- AUT-RF-004

**Prioridad**

Alta

**Criterios de aceptación**

- El usuario podrá registrar una nueva contraseña.
- El sistema validará que el proceso de recuperación haya sido autorizado.

**Valor de negocio**

Garantiza la continuidad del acceso al sistema de forma segura.