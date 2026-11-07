# ClimGuard
## Descripciòn de los Casos de Uso

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Casos de uso |
| Código | DOC-05 |
| Versión | 3.0 |
| Estado | Vigente (ClimGuard 4.1) |

### Historial de versiones
| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | Agosto 2026 | CU-001 a CU-008 (Fases 1 y 2). |
| 3.0 | Noviembre 2026 | CU-009 a CU-013 de las Fases 3 y 4; nota de vigencia en CU-004; CU-008 corregido para referir a HU-009 (bitácora). |

> Los casos CU-001 a CU-008 se conservan como se especificaron; las notas *Estado en ClimGuard 4.1* indican los cambios.

---

# Objetivo
El presente documento describe los casos de uso implementados en ClimGuard, especificando los actores involucrados, el flujo principal, los flujos alternos, las reglas de negocio y los requerimientos funcionales asociados a cada funcionalidad del sistema.

# CU-001 – Acceder al Sistema

## Información General

| Campo | Descripción |
|--------|-------------|
| **Código** | CU-001 |
| **Nombre** | Acceder al sistema |
| **Objetivo** | Permitir que un usuario autenticado acceda a las funcionalidades del sistema de acuerdo con el rol que tenga asignado. |
| **Actor principal** | Usuario registrado |
| **Actores secundarios** | — |
| **Prioridad** | Alta |
| **Frecuencia de uso** | Alta |
| **Disparador** | El usuario selecciona la opción "Iniciar sesión". |

---

## Precondiciones

- El usuario deberá encontrarse registrado en el sistema.
- El usuario deberá poseer una cuenta activa.
- El usuario deberá conocer sus credenciales de acceso.

---

## Postcondiciones

### En caso de éxito

- El usuario accederá al sistema.
- El sistema identificará el rol del usuario.
- Se mostrará el dashboard correspondiente al rol asignado.

### En caso de fallo

- El acceso será denegado.
- El sistema informará el motivo del rechazo.
- El usuario permanecerá en la pantalla de inicio de sesión.

---

## Flujo Principal

1. El usuario accede a la pantalla de inicio de sesión.
2. El usuario ingresa su nombre de usuario y contraseña.
3. El sistema valida las credenciales ingresadas.
4. El sistema verifica que la cuenta se encuentre activa.
5. El sistema identifica el rol asignado al usuario.
6. El sistema muestra el dashboard correspondiente.

---

## Flujos Alternos

### FA-01 – Credenciales incorrectas

1. El sistema detecta que las credenciales no son válidas.
2. El sistema muestra un mensaje indicando que las credenciales son incorrectas.
3. El usuario podrá intentar nuevamente.

---

### FA-02 – Usuario inactivo

1. El sistema detecta que la cuenta del usuario se encuentra inactiva.
2. El sistema deniega el acceso.
3. Se informa al usuario que debe comunicarse con el administrador.

---

### FA-03 – Error durante la autenticación

1. El sistema detecta un error inesperado durante el proceso de autenticación.
2. Se informa al usuario que no fue posible iniciar sesión.
3. El sistema registra el incidente.

---

## Reglas de Negocio Relacionadas

- RN-001 – Rol único por usuario.
- RN-002 – Acceso según rol.
- RN-016 – Autenticación obligatoria.
- RN-017 – Control de acceso.

---

## Requerimientos Funcionales Relacionados

- AUT-RF-001
- AUT-RF-002

---

## Historia de Usuario Relacionada

- HU-001 – Acceder al sistema

---

## Observaciones

- El dashboard presentado dependerá del rol asignado al usuario.
- El acceso a las funcionalidades estará restringido según los permisos asociados al rol.
- Todo inicio de sesión exitoso deberá registrarse en la bitácora del sistema.

# CU-002 – Gestionar Comunidades

## Información General

| Campo | Descripción |
|--------|-------------|
| **Código** | CU-002 |
| **Nombre** | Gestionar comunidades |
| **Objetivo** | Permitir al administrador registrar, consultar, modificar y eliminar comunidades, así como asociar sensores a cada una de ellas. |
| **Actor principal** | Administrador |
| **Actores secundarios** | — |
| **Prioridad** | Alta |
| **Frecuencia de uso** | Baja |
| **Disparador** | El administrador selecciona el módulo de Comunidades. |

---

## Precondiciones

- El administrador deberá encontrarse autenticado.
- El administrador deberá contar con permisos para administrar comunidades.

---

## Postcondiciones

### En caso de éxito

- La comunidad será registrada, modificada o eliminada correctamente.
- La información quedará actualizada.
- La acción realizada será registrada automáticamente en la bitácora.

### En caso de fallo

- No se realizarán cambios sobre la información.
- El sistema notificará el motivo del error.

---

## Flujo Principal

1. El administrador accede al módulo de Comunidades.
2. El sistema muestra el listado de comunidades registradas.
3. El administrador selecciona la acción a realizar.
4. El administrador ingresa o modifica la información correspondiente.
5. El sistema valida los datos ingresados.
6. El sistema guarda los cambios.
7. El sistema confirma la operación.
8. El sistema actualiza el listado de comunidades.

---

## Flujos Alternos

### FA-01 – Datos inválidos

1. El sistema detecta información inválida.
2. El sistema muestra los errores encontrados.
3. El administrador corrige la información.

---

### FA-02 – Comunidad inexistente

1. El administrador intenta modificar o eliminar una comunidad inexistente.
2. El sistema informa que la comunidad no existe.
3. La operación es cancelada.

---

## Reglas de Negocio Relacionadas

- RN-003
- RN-004
- RN-018
- RN-019

---

## Requerimientos Funcionales Relacionados

- COM-RF-001
- COM-RF-002

---

## Historia de Usuario Relacionada

- HU-002

---

## Observaciones

- Una comunidad podrá existir sin sensores asociados.
- Los sensores podrán asociarse durante el registro o posteriormente mediante una modificación.

# CU-003 – Gestionar Sensores

## Información General

| Campo | Descripción |
|--------|-------------|
| **Código** | CU-003 |
| **Nombre** | Gestionar sensores |
| **Objetivo** | Permitir al administrador registrar, consultar, modificar, activar y desactivar sensores del sistema. |
| **Actor principal** | Administrador |
| **Actores secundarios** | — |
| **Prioridad** | Alta |
| **Frecuencia de uso** | Media |
| **Disparador** | El administrador selecciona el módulo de Sensores. |

---

## Precondiciones

- El administrador deberá encontrarse autenticado.
- El administrador deberá contar con permisos para administrar sensores.

---

## Postcondiciones

### En caso de éxito

- El sensor quedará registrado o actualizado.
- El estado del sensor será actualizado cuando corresponda.
- La acción realizada será registrada automáticamente en la bitácora.

### En caso de fallo

- No se modificarán los datos del sensor.
- El sistema notificará el motivo del error.

---

## Flujo Principal

1. El administrador accede al módulo de Sensores.
2. El sistema muestra el listado de sensores.
3. El administrador selecciona la acción a realizar.
4. El administrador ingresa o modifica la información del sensor.
5. El sistema valida la información.
6. El sistema guarda los cambios.
7. El sistema confirma la operación.
8. El sistema actualiza el listado de sensores.

---

## Flujos Alternos

### FA-01 – Nombre duplicado

1. El sistema detecta un nombre ya registrado.
2. El sistema informa el error.
3. El administrador deberá ingresar otro nombre.

---

### FA-02 – Comunidad inexistente

1. El administrador intenta asociar un sensor a una comunidad inexistente.
2. El sistema cancela la operación.
3. Se informa el motivo.

---

## Reglas de Negocio Relacionadas

- RN-005
- RN-006
- RN-018

---

## Requerimientos Funcionales Relacionados

- SEN-RF-001
- SEN-RF-002

---

## Historia de Usuario Relacionada

- HU-003

---

## Observaciones

- Todo sensor deberá pertenecer a una única comunidad.

# CU-004 – Configurar Umbrales

> **Estado en ClimGuard 4.1:** reemplazado por **CU-013 – Gestionar reglas de alerta**.

## Información General

| Campo | Descripción |
|--------|-------------|
| **Código** | CU-004 |
| **Nombre** | Configurar umbrales |
| **Objetivo** | Permitir al operador configurar los valores utilizados para determinar condiciones de riesgo en las variables climáticas monitoreadas. |
| **Actor principal** | Administrador |
| **Actores secundarios** | — |
| **Prioridad** | Alta |
| **Frecuencia de uso** | Baja |
| **Disparador** | El administrador selecciona el módulo de Configuración. |

---

## Precondiciones

- El administrador deberá encontrarse autenticado.
- El administrador deberá contar con permisos para modificar la configuración.

---

## Postcondiciones

### En caso de éxito

- Los nuevos umbrales quedarán registrados.
- Las futuras lecturas utilizarán la nueva configuración.
- La acción será registrada en la bitácora.

### En caso de fallo

- La configuración permanecerá sin cambios.
- El sistema informará el motivo del error.

---

## Flujo Principal

1. El administrador accede al módulo de Configuración.
2. El sistema muestra los umbrales actuales.
3. El administrador modifica los valores correspondientes.
4. El sistema valida la información ingresada.
5. El sistema guarda la nueva configuración.
6. El sistema registra la acción en la bitácora.
7. El sistema confirma la actualización.

---

## Flujos Alternos

### FA-01 – Valor inválido

1. El sistema detecta un valor fuera del rango permitido.
2. El sistema informa el error.
3. El administrador corrige la información.

---

## Reglas de Negocio Relacionadas

- RN-014
- RN-015
- RN-018

---

## Requerimientos Funcionales Relacionados

- CFG-RF-001

---

## Historia de Usuario Relacionada

- HU-005

---

## Observaciones

- Los cambios únicamente afectarán las lecturas procesadas después de guardar la nueva configuración.


# CU-005 – Monitorear Variables Climáticas

## Información General

| Campo | Descripción |
|--------|-------------|
| **Código** | CU-005 |
| **Nombre** | Monitorear variables climáticas |
| **Objetivo** | Permitir al operador visualizar en tiempo real las variables climáticas registradas por los sensores de las comunidades. |
| **Actor principal** | Operador |
| **Actores secundarios** | — |
| **Prioridad** | Alta |
| **Frecuencia de uso** | Alta |
| **Disparador** | El usuario accede al Dashboard del sistema. |

---

## Precondiciones

- El usuario deberá encontrarse autenticado.
- El usuario deberá contar con permisos para consultar el monitoreo.

---

## Postcondiciones

### En caso de éxito

- El usuario visualizará las variables climáticas actualizadas.
- El estado de los sensores será mostrado correctamente.

### En caso de fallo

- El sistema informará que no fue posible obtener las lecturas.

---

## Flujo Principal

1. El usuario accede al Dashboard.
2. El sistema muestra las comunidades disponibles.
3. El usuario selecciona una comunidad.
4. El sistema obtiene las lecturas de los sensores asociados.
5. El sistema actualiza automáticamente la información.
6. El sistema muestra las variables climáticas y el estado de los sensores.

---

## Flujos Alternos

### FA-01 – Comunidad sin sensores

1. El sistema detecta que la comunidad no posee sensores asociados.
2. El sistema informa al usuario.
3. El proceso finaliza.

---

### FA-02 – Sensor sin comunicación

1. Uno o más sensores no están transmitiendo información.
2. El resto de la información continúa mostrándose normalmente.

---

## Reglas de Negocio Relacionadas

- RN-005
- RN-008
- RN-009

---

## Requerimientos Funcionales Relacionados

- MON-RF-001
- MON-RF-002
- MON-RF-003
- DAS-RF-001
- DAS-RF-002
- DAS-RF-003

---

## Historia de Usuario Relacionada

- HU-006

---

## Observaciones

- La actualización de la información deberá realizarse automáticamente mediante SignalR.

# CU-006 – Recibir Alertas

## Información General

| Campo | Descripción |
|--------|-------------|
| **Código** | CU-006 |
| **Nombre** | Recibir alertas |
| **Objetivo** | Notificar al usuario cuando el sistema detecte una condición de riesgo. |
| **Actor principal** | Operador |
| **Actores secundarios** |  |
| **Prioridad** | Alta |
| **Frecuencia de uso** | Alta |
| **Disparador** | Una lectura supera un umbral configurado. |

---

## Precondiciones

- El usuario deberá encontrarse autenticado.
- Deberán existir umbrales configurados.

---

## Postcondiciones

### En caso de éxito

- El usuario recibirá la alerta.
- La alerta será almacenada en la base de datos.

### En caso de fallo

- El sistema registrará el incidente.
- La alerta quedará pendiente de notificación.

---

## Flujo Principal

1. El sistema recibe una nueva lectura.
2. El sistema compara la lectura con los umbrales configurados.
3. El sistema detecta una condición de riesgo.
4. El sistema clasifica la alerta.
5. El sistema registra la alerta.
6. El sistema notifica al usuario.

---

## Flujos Alternos

### FA-01 – Lectura dentro del rango permitido

1. El sistema determina que la lectura no supera ningún umbral.
2. El monitoreo continúa normalmente.

---

## Reglas de Negocio Relacionadas

- RN-010
- RN-011
- RN-012
- RN-013

---

## Requerimientos Funcionales Relacionados

- ALT-RF-001
- ALT-RF-002
- ALT-RF-003

---

## Historia de Usuario Relacionada

- HU-007

---

## Observaciones
- La generación de alertas será completamente automática.
- La notificación de nuevas alertas será enviada en tiempo real mediante SignalR.


# CU-007 – Visualizar alertas activas

## Información General

| Campo | Descripción |
|--------|-------------|
| **Código** | CU-007 |
| **Nombre** | Visualizar alertas activas |
| **Objetivo** | Permitir al operador visualizar las alertas activas generadas por el sistema. |
| **Actor principal** | Operador |
| **Actores secundarios** | — |
| **Prioridad** | Media |
| **Frecuencia de uso** | Alta |
| **Disparador** | El operador accede al panel de alertas activas. |

---

## Precondiciones

- El operador deberá encontrarse autenticado.
- Deberán existir alertas registradas.

---

## Postcondiciones

### En caso de éxito

- El sistema mostrará las alertas activas disponibles.

### En caso de fallo

- El sistema informará que la alerta no pudo ser consultada.

---

## Flujo Principal

1. El operador accede al panel de alertas.
2. El sistema obtiene las alertas activas registradas.
3. El sistema muestra las alertas disponibles.

---

## Flujos Alternos

### FA-01 – No existen alertas

1. El sistema detecta que no existen alertas registradas.
2. Se informa al operador.

---

## Reglas de Negocio Relacionadas

- RN-010
- RN-011
- RN-012
- RN-013

---

## Requerimientos Funcionales Relacionados

- ALT-RF-004

---

## Historia de Usuario Relacionada

- HU-008


# CU-008 – Consultar Bitácora

## Información General

| Campo | Descripción |
|--------|-------------|
| **Código** | CU-010 |
| **Nombre** | Consultar bitácora |
| **Objetivo** | Permitir al administrador auditar las acciones realizadas por los usuarios del sistema. |
| **Actor principal** | Administrador |
| **Actores secundarios** | — |
| **Prioridad** | Media |
| **Frecuencia de uso** | Baja |
| **Disparador** | El administrador accede al módulo de Bitácora. |

---

## Precondiciones

- El administrador deberá encontrarse autenticado.

---

## Postcondiciones

### En caso de éxito

- El sistema mostrará la bitácora de acciones.

### En caso de fallo

- El sistema informará el error correspondiente.

---

## Flujo Principal

1. El administrador accede al módulo de Bitácora.
2. El sistema obtiene los registros existentes.
3. El sistema muestra la bitácora.
4. El administrador consulta la información requerida.

---

## Flujos Alternos

### FA-01 – Bitácora sin registros

1. El sistema detecta que no existen registros.
2. El sistema informa al administrador.

---

## Reglas de Negocio Relacionadas

- RN-018
- RN-019

---

## Requerimientos Funcionales Relacionados

- USR-RF-003

---

## Historia de Usuario Relacionada

- HU-009

---

# CU-009 – Iniciar sesión con un proveedor externo

## Información General

| Campo | Descripción |
|--------|-------------|
| **Código** | CU-009 |
| **Nombre** | Iniciar sesión con un proveedor externo |
| **Objetivo** | Permitir el acceso con una cuenta de Google o GitHub. |
| **Actor principal** | Usuario |
| **Actores secundarios** | Google / GitHub, auth-service |
| **Prioridad** | Alta |
| **Frecuencia de uso** | Alta |
| **Disparador** | El usuario pulsa el botón de un proveedor en la pantalla de inicio de sesión. |

---

## Precondiciones

- El proveedor está configurado en el servidor.
- El usuario tiene una cuenta en el proveedor.

---

## Postcondiciones

### En caso de éxito

- El usuario entra al panel con una sesión de ClimGuard.
- Si era su primer acceso y el auto-registro está habilitado, queda registrado con rol Consulta.
- El acceso queda en la bitácora.

### En caso de fallo

- El usuario vuelve a la pantalla de inicio con un mensaje que explica el motivo.
- No se crea ninguna sesión.

---

## Flujo Principal

1. El usuario pulsa Google o GitHub.
2. El sistema genera los datos de seguridad del flujo y redirige al proveedor.
3. El usuario se autentica y autoriza en el proveedor.
4. El proveedor devuelve al sistema un código de autorización.
5. El sistema canjea el código, valida la identidad y localiza o crea al usuario.
6. El sistema entrega al navegador un código de un solo uso.
7. El navegador canjea ese código por la sesión de ClimGuard.
8. El sistema muestra el panel.

---

## Flujos Alternos

### FA-01 – Cuenta no registrada

1. El auto-registro está deshabilitado y la identidad no existe.
2. El sistema informa que la cuenta no está registrada.

### FA-02 – Correo no verificado o dominio no autorizado

1. El proveedor no confirma un correo verificado o el dominio no está permitido.
2. El sistema rechaza el registro e informa el motivo.

### FA-03 – Flujo expirado o cancelado

1. El usuario cancela o tarda demasiado.
2. El sistema informa que debe intentarlo de nuevo.

---

## Reglas de Negocio Relacionadas

- RN-024
- RN-025
- RN-026

## Requerimientos Funcionales Relacionados

- AUT-RF-003
- AUT-RF-004

## Historia de Usuario Relacionada

- HU-010

---

# CU-010 – Registrar una lectura de un sensor físico

## Información General

| Campo | Descripción |
|--------|-------------|
| **Código** | CU-010 |
| **Nombre** | Registrar una lectura de un sensor físico |
| **Objetivo** | Incorporar al sistema las mediciones de un dispositivo real. |
| **Actor principal** | Dispositivo ESP8266 |
| **Actores secundarios** | sensor-service, alert-service |
| **Prioridad** | Alta |
| **Frecuencia de uso** | Continua |
| **Disparador** | El dispositivo obtiene una nueva medición. |

---

## Precondiciones

- El sensor existe, está activo y su origen es Físico.
- El dispositivo dispone de una cuenta de servicio con rol Operador.

---

## Postcondiciones

### En caso de éxito

- La lectura queda almacenada.
- El panel la muestra en tiempo real.
- Si la lectura cae en un intervalo de peligro, se genera la alerta correspondiente.

### En caso de fallo

- La lectura no se registra y el dispositivo recibe el código de error.

---

## Flujo Principal

1. El dispositivo inicia sesión y obtiene un token.
2. El dispositivo envía la lectura con su token.
3. El sistema valida el token y los datos.
4. El sistema guarda la lectura y la publica en tiempo real.
5. El sistema evalúa la lectura contra las reglas activas del tipo de sensor.
6. Si corresponde, el sistema genera y publica una alerta.

---

## Flujos Alternos

### FA-01 – Token vencido

1. El sistema responde que el token no es válido.
2. El dispositivo inicia sesión de nuevo y reenvía la lectura.

### FA-02 – Datos inválidos

1. El sistema rechaza la lectura e indica el error.

---

## Reglas de Negocio Relacionadas

- RN-009
- RN-011
- RN-022
- RN-027

## Requerimientos Funcionales Relacionados

- SEN-RF-004
- MON-RF-002
- ALT-RF-001

## Historia de Usuario Relacionada

- HU-013

---

# CU-011 – Atender una alerta

## Información General

| Campo | Descripción |
|--------|-------------|
| **Código** | CU-011 |
| **Nombre** | Atender una alerta |
| **Objetivo** | Registrar la atención de una alerta activa. |
| **Actor principal** | Operador |
| **Actores secundarios** | Administrador |
| **Prioridad** | Alta |
| **Frecuencia de uso** | Media |
| **Disparador** | El operador selecciona Atender en una alerta activa. |

---

## Precondiciones

- El usuario tiene rol Operador o Administrador.
- La alerta está activa.

---

## Postcondiciones

### En caso de éxito

- La alerta queda en estado Atendida con el responsable registrado.
- La alerta deja de figurar entre las activas y aparece en el historial.

### En caso de fallo

- La alerta permanece activa y se informa el error.

---

## Flujo Principal

1. El usuario abre Alertas.
2. El sistema muestra las alertas activas.
3. El usuario pulsa Atender.
4. El sistema cambia el estado y registra al responsable.
5. El sistema actualiza la lista.

---

## Flujos Alternos

### FA-01 – Sin permiso

1. El usuario no tiene el rol requerido.
2. El sistema no muestra la acción o la rechaza.

---

## Reglas de Negocio Relacionadas

- RN-013
- RN-015

## Requerimientos Funcionales Relacionados

- ALT-RF-005

## Historia de Usuario Relacionada

- HU-015

---

# CU-012 – Generar un reporte PDF

## Información General

| Campo | Descripción |
|--------|-------------|
| **Código** | CU-012 |
| **Nombre** | Generar un reporte PDF |
| **Objetivo** | Obtener un reporte en PDF con información filtrada. |
| **Actor principal** | Administrador |
| **Actores secundarios** | report-service |
| **Prioridad** | Alta |
| **Frecuencia de uso** | Media |
| **Disparador** | El administrador elige un tipo de reporte y pulsa Generar PDF. |

---

## Precondiciones

- El usuario tiene rol Administrador.

---

## Postcondiciones

### En caso de éxito

- El reporte queda en el historial con su identificador.
- El PDF puede descargarse.

### En caso de fallo

- El reporte queda en estado fallido o no se crea, y se informa el motivo.

---

## Flujo Principal

1. El administrador abre Reportes.
2. Elige el tipo de reporte.
3. Completa los filtros.
4. Pulsa Generar PDF.
5. El sistema reúne los datos de los servicios correspondientes y genera el PDF.
6. El sistema registra el reporte en el historial.
7. El administrador descarga el PDF.

---

## Flujos Alternos

### FA-01 – Límite de filas superado

1. El sistema informa el límite y el total.
2. El administrador acota los filtros y repite la generación.

### FA-02 – Cola llena

1. Hay demasiados reportes en proceso.
2. El sistema pide intentarlo más tarde.

---

## Reglas de Negocio Relacionadas

- RN-029

## Requerimientos Funcionales Relacionados

- REP-RF-001
- REP-RF-002
- REP-RF-003

## Historia de Usuario Relacionada

- HU-016

---

# CU-013 – Gestionar reglas de alerta

## Información General

| Campo | Descripción |
|--------|-------------|
| **Código** | CU-013 |
| **Nombre** | Gestionar reglas de alerta |
| **Objetivo** | Definir cuándo una lectura genera una alerta. |
| **Actor principal** | Administrador |
| **Actores secundarios** | — |
| **Prioridad** | Alta |
| **Frecuencia de uso** | Baja |
| **Disparador** | El administrador abre Reglas de alerta. |

---

## Precondiciones

- El usuario tiene rol Administrador.

---

## Postcondiciones

### En caso de éxito

- La regla queda registrada y se aplica a las lecturas siguientes.
- La acción queda en la bitácora.

### En caso de fallo

- La regla no cambia y se informa el error.

---

## Flujo Principal

1. El administrador pulsa Nueva regla o Editar.
2. Indica tipo de sensor, mínimo, máximo, nivel, fenómeno y mensaje.
3. El sistema valida que el mínimo no supere el máximo.
4. El sistema guarda la regla.

---

## Flujos Alternos

### FA-01 – Regla heredada

1. La regla usa la semántica anterior.
2. El administrador marca Convertir a la semántica nueva e indica el intervalo de peligro.
3. El sistema guarda la conversión y la registra en la bitácora.

### FA-02 – Intervalo inválido

1. El mínimo es mayor que el máximo.
2. El sistema impide guardar.

---

## Reglas de Negocio Relacionadas

- RN-016
- RN-017
- RN-022

## Requerimientos Funcionales Relacionados

- REG-RF-001

## Historia de Usuario Relacionada

- HU-018

---

