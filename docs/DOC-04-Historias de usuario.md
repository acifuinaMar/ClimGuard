# ClimGuard
## Historias de Usuario

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Historias de Usuario |
| Código | DOC-04 |
| Versión | 3.0 |
| Estado | Vigente (ClimGuard 4.1) |

### Historial de versiones
| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | Agosto 2026 | HU-001 a HU-009 (Fases 1 y 2). |
| 3.0 | Noviembre 2026 | HU-010 a HU-018 de las Fases 3 y 4; nota de vigencia en HU-005. |

> Las historias HU-001 a HU-009 se conservan como se definieron; las notas *Estado en ClimGuard 4.1* indican cómo se implementan hoy.

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

> **Estado en ClimGuard 4.1:** los umbrales se implementan como **reglas de alerta** con un intervalo de peligro por tipo de sensor (HU-018, REG-RF-001).

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

---

# 3. Historias incorporadas en las Fases 3 y 4

## HU-010 – Iniciar sesión con Google o GitHub

**Como** usuario

**Quiero** entrar con mi cuenta de Google o de GitHub

**Para** no tener que recordar otra contraseña.

**Requerimientos relacionados**

- AUT-RF-003
- AUT-RF-004

**Prioridad**

Alta

**Criterios de aceptación**

- La pantalla de inicio muestra los proveedores habilitados.
- Tras autorizar en el proveedor, entro al panel con el mismo tipo de sesión que el inicio local.
- Si es mi primer acceso y el auto-registro está habilitado, se crea mi cuenta con rol Consulta.
- Si algo falla, veo un mensaje que explica el motivo.

**Valor de negocio**

Facilita el acceso de nuevos usuarios sin crear credenciales adicionales.

---

## HU-011 – Vincular mi cuenta externa

**Como** usuario con usuario y contraseña

**Quiero** vincular mi cuenta de Google o GitHub

**Para** poder entrar también con ella.

**Requerimientos relacionados**

- AUT-RF-005

**Prioridad**

Media

**Criterios de aceptación**

- Desde el panel puedo iniciar la vinculación con Google o GitHub.
- Una cuenta externa no puede quedar vinculada a dos usuarios.

**Valor de negocio**

Permite migrar usuarios existentes al acceso con proveedores externos.

---

## HU-012 – Registrar el origen de un sensor

**Como** Administrador

**Quiero** indicar si un sensor es físico o simulado

**Para** que el sistema solo genere lecturas automáticas para los simulados.

**Requerimientos relacionados**

- SEN-RF-003

**Prioridad**

Alta

**Criterios de aceptación**

- El formulario exige elegir el origen.
- El origen se muestra en la lista de sensores.
- Los sensores simulados activos reciben lecturas automáticas; los físicos no.

**Valor de negocio**

Evita mezclar datos simulados con mediciones reales.

---

## HU-013 – Enviar lecturas desde un dispositivo

**Como** responsable técnico de un sensor físico

**Quiero** que el dispositivo envíe sus lecturas al sistema

**Para** monitorear la comunidad con datos reales.

**Requerimientos relacionados**

- SEN-RF-004

**Prioridad**

Alta

**Criterios de aceptación**

- El dispositivo se autentica con una cuenta de servicio de rol Operador.
- Cada lectura enviada aparece en el panel en tiempo real y se evalúa contra las reglas.

**Valor de negocio**

Convierte ClimGuard en un sistema de monitoreo con sensores reales.

---

## HU-014 – Elegir comunidad, departamento y municipio de una lista

**Como** Administrador

**Quiero** seleccionar la comunidad de un sensor y el departamento y municipio de una comunidad desde listas

**Para** evitar errores de escritura y datos inconsistentes.

**Requerimientos relacionados**

- SEN-RF-005
- COM-RF-003

**Prioridad**

Media

**Criterios de aceptación**

- La lista de comunidades muestra las activas por nombre.
- Al elegir un departamento de Guatemala, la lista de municipios se filtra.
- Los valores guardados que no están en el catálogo se conservan.

**Valor de negocio**

Mejora la calidad de los datos geográficos y de los reportes.

---

## HU-015 – Atender una alerta

**Como** Operador

**Quiero** marcar como atendida una alerta activa

**Para** que quede constancia de quién la atendió.

**Requerimientos relacionados**

- ALT-RF-005

**Prioridad**

Alta

**Criterios de aceptación**

- Solo Administrador y Operador ven la acción Atender.
- La alerta pasa al historial con el nombre del responsable.

**Valor de negocio**

Permite seguir la respuesta ante cada evento de riesgo.

---

## HU-016 – Generar y descargar reportes

**Como** Administrador

**Quiero** generar reportes PDF con filtros y descargarlos después

**Para** compartir información con las autoridades y la comunidad.

**Requerimientos relacionados**

- REP-RF-001
- REP-RF-002
- REP-RF-003

**Prioridad**

Alta

**Criterios de aceptación**

- Puedo elegir entre ocho tipos de reporte y sus filtros.
- El historial muestra los reportes generados y permite descargarlos.
- Si un reporte excede el límite de filas, se me indica cómo acotarlo.

**Valor de negocio**

Facilita la rendición de cuentas y el análisis de eventos.

---

## HU-017 – Gestionar tipos de fenómeno

**Como** Operador

**Quiero** mantener el catálogo de tipos de fenómeno

**Para** clasificar correctamente reglas y alertas.

**Requerimientos relacionados**

- REG-RF-002

**Prioridad**

Media

**Criterios de aceptación**

- Puedo crear, editar, activar o desactivar y eliminar tipos de fenómeno.

**Valor de negocio**

Adapta la clasificación de eventos a la realidad de cada región.

---

## HU-018 – Gestionar reglas de alerta

**Como** Administrador

**Quiero** definir reglas con un intervalo de peligro por tipo de sensor

**Para** que el sistema genere alertas con el nivel y mensaje adecuados.

**Requerimientos relacionados**

- REG-RF-001

**Prioridad**

Alta

**Criterios de aceptación**

- Cada regla tiene tipo de sensor, mínimo, máximo, nivel, fenómeno y mensaje.
- El mínimo no puede ser mayor que el máximo.
- Las reglas heredadas se siguen evaluando como antes hasta que las convierta.

**Valor de negocio**

Sustituye a la configuración de umbrales (HU-005) con reglas más expresivas.

---

