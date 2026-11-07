# ClimGuard
## Sistema Web de Monitoreo y Alerta Temprana para Riesgos Climáticos

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Especificación de Requerimientos |
| Código | DOC-02 |
| Versión | 3.0 |
| Estado | Vigente (ClimGuard 4.1) |
| Fecha | Noviembre 2026 |
| Tecnologías | Angular 22, .NET 10, NestJS, Spring Boot, FastAPI, PostgreSQL 16, SQL Server 2022, MongoDB 7, SignalR, Docker, Kubernetes (K3s) |

### Historial de versiones
| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | Agosto 2026 | Requerimientos de las Fases 1 y 2 (módulos 1 a 9, RNF-001 a RNF-011). |
| 3.0 | Noviembre 2026 | Se agregan los requerimientos implementados en las Fases 3 y 4 (sección 10 y RNF-012 a RNF-016). CFG-RF-001 queda reemplazado por REG-RF-001; las restricciones se actualizan a la arquitectura de microservicios. |

---

# Introducción

El presente documento especifica los requerimientos funcionales y no funcionales del sistema **ClimGuard**, identificando las funcionalidades implementadas, las restricciones técnicas, los supuestos del proyecto y los criterios generales de aceptación. Este documento sirve como base para verificar que la solución desarrollada cumple con los objetivos definidos durante el análisis y diseño del sistema.

---

# Requerimientos Funcionales

## 1 Módulo de Autenticación

### AUT-RF-001 – Iniciar sesión

| Campo | Descripción |
|--------|-------------|
| **Código** | AUT-RF-001 |
| **Nombre** | Iniciar sesión |
| **Módulo** | Autenticación |
| **Actor** | Administrador, Operador, Usuario de Monitoreo |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá permitir que los usuarios se autentiquen mediante sus credenciales para acceder a las funcionalidades autorizadas según su rol. |

---

### AUT-RF-002 – Cerrar sesión

| Campo | Descripción |
|--------|-------------|
| **Código** | AUT-RF-002 |
| **Nombre** | Cerrar sesión |
| **Módulo** | Autenticación |
| **Actor** | Administrador, Operador, Usuario de Monitoreo |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá permitir a los usuarios finalizar su sesión de forma segura. |

---

## 2 Módulo de Monitoreo Climático

### MON-RF-001 – Visualizar variables climáticas

| Campo | Descripción |
|--------|-------------|
| **Código** | MON-RF-001 |
| **Nombre** | Visualizar variables climáticas |
| **Módulo** | Monitoreo Climático |
| **Actor** | Operador, Usuario de Monitoreo |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá mostrar las variables climáticas monitoreadas para cada comunidad registrada. |

---

### MON-RF-002 – Actualizar lecturas en tiempo real

| Campo | Descripción |
|--------|-------------|
| **Código** | MON-RF-002 |
| **Nombre** | Actualización en tiempo real |
| **Módulo** | Monitoreo Climático |
| **Actor** | Operador, Usuario de Monitoreo |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá actualizar automáticamente las lecturas recibidas sin requerir la recarga manual de la página. |

---

### MON-RF-003 – Visualizar estado de sensores

| Campo | Descripción |
|--------|-------------|
| **Código** | MON-RF-003 |
| **Nombre** | Estado de sensores |
| **Módulo** | Monitoreo Climático |
| **Actor** | Operador |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá mostrar el estado operativo de los sensores registrados. |

---

## 3. Módulo de Gestión de Alertas

### ALT-RF-001 – Detectar condiciones de riesgo

| Campo | Descripción |
|--------|-------------|
| **Código** | ALT-RF-001 |
| **Nombre** | Detectar condiciones de riesgo |
| **Módulo** | Gestión de Alertas |
| **Actor** | Operador |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá evaluar automáticamente las lecturas recibidas para identificar condiciones de riesgo de acuerdo con los umbrales configurados. |

---

### ALT-RF-002 – Clasificar alertas

| Campo | Descripción |
|--------|-------------|
| **Código** | ALT-RF-002 |
| **Nombre** | Clasificar alertas |
| **Módulo** | Gestión de Alertas |
| **Actor** | Operador |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá clasificar las alertas generadas según el nivel de peligro correspondiente (Normal, Precaución, Alerta, Emergencia) |

---

### ALT-RF-003 – Emitir alertas

| Campo | Descripción |
|--------|-------------|
| **Código** | ALT-RF-003 |
| **Nombre** | Emitir alertas |
| **Módulo** | Gestión de Alertas |
| **Actor** | Operador, Usuario de Monitoreo |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá notificar a los usuarios cuando se detecte una condición de riesgo. |

---

### ALT-RF-004 – Consultar detalle de una alerta

| Campo | Descripción |
|--------|-------------|
| **Código** | ALT-RF-004 |
| **Nombre** | Consultar detalle de una alerta |
| **Módulo** | Gestión de Alertas |
| **Actor** | Operador, Usuario de Monitoreo |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá permitir consultar la información detallada de una alerta generada. |

---

## 4. Módulo de Historial

### HIS-RF-001 – Registrar eventos

| Campo | Descripción |
|--------|-------------|
| **Código** | HIS-RF-001 |
| **Nombre** | Registrar eventos |
| **Módulo** | Historial |
| **Actor** | Operador |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá registrar automáticamente los eventos generados por las alertas detectadas. |

---

### HIS-RF-002 – Consultar historial

| Campo | Descripción |
|--------|-------------|
| **Código** | HIS-RF-002 |
| **Nombre** | Consultar historial |
| **Módulo** | Historial |
| **Actor** | Operador, Usuario de Monitoreo |
| **Prioridad** | Media |
| **Descripción** | El sistema deberá permitir consultar el historial de eventos registrados. |

---

### HIS-RF-003 – Visualizar detalle de un evento

| Campo | Descripción |
|--------|-------------|
| **Código** | HIS-RF-003 |
| **Nombre** | Visualizar detalle de un evento |
| **Módulo** | Historial |
| **Actor** | Operador, Usuario de Monitoreo |
| **Prioridad** | Media |
| **Descripción** | El sistema deberá mostrar la información detallada de un evento registrado. |

---

## 5. Módulo de Gestión de Sensores

### SEN-RF-001 – Gestionar sensores

| Campo | Descripción |
|--------|-------------|
| **Código** | SEN-RF-001 |
| **Nombre** | Gestionar sensores |
| **Módulo** | Gestión de Sensores |
| **Actor** | Administrador |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá permitir registrar, consultar y modificar la información de los sensores registrados. |

---

### SEN-RF-002 – Activar o desactivar sensores

| Campo | Descripción |
|--------|-------------|
| **Código** | SEN-RF-002 |
| **Nombre** | Activar o desactivar sensores |
| **Módulo** | Gestión de Sensores |
| **Actor** | Administrador |
| **Prioridad** | Media |
| **Descripción** | El sistema deberá permitir modificar el estado operativo de los sensores registrados. |

---

## 6. Módulo de Gestión de Comunidades

### COM-RF-001 – Gestionar comunidades

| Campo | Descripción |
|--------|-------------|
| **Código** | COM-RF-001 |
| **Nombre** | Gestionar comunidades |
| **Módulo** | Gestión de Comunidades |
| **Actor** | Administrador |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá permitir registrar, consultar, modificar y eliminar comunidades. |

---

### COM-RF-002 – Asociar sensores a comunidades

| Campo | Descripción |
|--------|-------------|
| **Código** | COM-RF-002 |
| **Nombre** | Asociar sensores a comunidades |
| **Módulo** | Gestión de Comunidades |
| **Actor** | Administrador |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá permitir asociar uno o más sensores a una comunidad. |

---

## 7. Módulo de Gestión de Usuarios

### USR-RF-001 – Administrar información de usuarios

| Campo | Descripción |
|--------|-------------|
| **Código** | USR-RF-001 |
| **Nombre** | Administrar información de usuarios |
| **Módulo** | Gestión de Usuarios |
| **Actor** | Administrador |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá permitir consultar la información de los usuarios registrados. La creación de nuevas cuentas será responsabilidad del administrador de la base de datos (DBA), por tratarse de una plataforma institucional. |

---

### USR-RF-002 – Asignar roles

| Campo | Descripción |
|--------|-------------|
| **Código** | USR-RF-002 |
| **Nombre** | Asignar roles |
| **Módulo** | Gestión de Usuarios |
| **Actor** | Administrador |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá permitir asignar el rol correspondiente a cada usuario. |

---

### USR-RF-003 – Consulta de bitácora

| Campo | Descripción |
|--------|-------------|
| **Código** | USR-RF-003 |
| **Nombre** | Consultar bitàcora |
| **Actor** | Administrador |
| **Prioridad** | Media |
| **Descripción** | El sistema deberá permitir al administrador consultar la bitácora de acciones realizadas por los usuarios. |

---

## 8. Módulo Dashboard

### DAS-RF-001 – Visualizar indicadores

| Campo | Descripción |
|--------|-------------|
| **Código** | DAS-RF-001 |
| **Nombre** | Visualizar indicadores |
| **Módulo** | Dashboard |
| **Actor** | Administrador, Operador, Usuario de Monitoreo |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá mostrar indicadores generales relacionados con el monitoreo climático. |

---

### DAS-RF-002 – Visualizar gráficas

| Campo | Descripción |
|--------|-------------|
| **Código** | DAS-RF-002 |
| **Nombre** | Visualizar gráficas |
| **Módulo** | Dashboard |
| **Actor** | Operador, Usuario de Monitoreo |
| **Prioridad** | Media |
| **Descripción** | El sistema deberá representar gráficamente la evolución de las variables climáticas monitoreadas. |

---

### DAS-RF-003 – Visualizar estado general del sistema

| Campo | Descripción |
|--------|-------------|
| **Código** | DAS-RF-003 |
| **Nombre** | Visualizar estado general del sistema |
| **Módulo** | Dashboard |
| **Actor** | Administrador, Operador, Usuario de Monitoreo |
| **Prioridad** | Media |
| **Descripción** | El sistema deberá mostrar un resumen del estado general de las comunidades monitoreadas. |

---

## 9. Módulo de Configuración

### CFG-RF-001 – Configurar umbrales

| Campo | Descripción |
|--------|-------------|
| **Código** | CFG-RF-001 |
| **Nombre** | Configurar umbrales |
| **Módulo** | Configuración |
| **Actor** | Operador |
| **Prioridad** | Alta |
| **Descripción** |El sistema deberá permitir modificar los valores de precaución, alerta y emergencia asociados a cada uno de los tipos de sensor definidos en el sistema. |

> **Estado en ClimGuard 4.1:** reemplazado por **REG-RF-001** (reglas de alerta por intervalo de peligro). Se conserva como requerimiento original de la Fase 2.

---

### CFG-RF-002 – Configurar parámetros generales

| Campo | Descripción |
|--------|-------------|
| **Código** | CFG-RF-002 |
| **Nombre** | Configurar parámetros generales |
| **Módulo** | Configuración |
| **Actor** | Administrador |
| **Prioridad** | Media |
| **Descripción** | El sistema deberá permitir administrar los parámetros generales de funcionamiento del sistema. |

## 10. Requerimientos incorporados en las Fases 3 y 4

### AUT-RF-003 – Iniciar sesión con Google o GitHub

| Campo | Descripción |
|--------|-------------|
| **Código** | AUT-RF-003 |
| **Nombre** | Iniciar sesión con Google o GitHub |
| **Módulo** | Autenticación |
| **Actor** | Usuario |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá permitir iniciar sesión con una cuenta de Google (OpenID Connect) o de GitHub (OAuth 2.0) y emitir el mismo token de sesión que el inicio de sesión local. |

---

### AUT-RF-004 – Registro automático de cuentas externas

| Campo | Descripción |
|--------|-------------|
| **Código** | AUT-RF-004 |
| **Nombre** | Registro automático de cuentas externas |
| **Módulo** | Autenticación |
| **Actor** | Sistema |
| **Prioridad** | Media |
| **Descripción** | Si está habilitado, el sistema deberá registrar automáticamente a quien entra por primera vez con Google o GitHub, con rol Consulta, solo si el proveedor confirma un correo verificado y, opcionalmente, si su dominio está autorizado. |

---

### AUT-RF-005 – Vincular una cuenta externa

| Campo | Descripción |
|--------|-------------|
| **Código** | AUT-RF-005 |
| **Nombre** | Vincular una cuenta externa |
| **Módulo** | Autenticación |
| **Actor** | Usuario autenticado |
| **Prioridad** | Media |
| **Descripción** | El sistema deberá permitir que un usuario con sesión iniciada vincule su cuenta de Google o GitHub para usarla en accesos posteriores. |

---

### SEN-RF-003 – Indicar el origen de las lecturas

| Campo | Descripción |
|--------|-------------|
| **Código** | SEN-RF-003 |
| **Nombre** | Indicar el origen de las lecturas |
| **Módulo** | Gestión de Sensores |
| **Actor** | Administrador |
| **Prioridad** | Alta |
| **Descripción** | Cada sensor deberá registrarse como Físico (lecturas enviadas por un dispositivo) o Simulado (lecturas generadas por el sistema mientras esté activo). |

---

### SEN-RF-004 – Recibir lecturas de dispositivos físicos

| Campo | Descripción |
|--------|-------------|
| **Código** | SEN-RF-004 |
| **Nombre** | Recibir lecturas de dispositivos físicos |
| **Módulo** | Monitoreo Climático |
| **Actor** | Dispositivo (rol Operador) |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá aceptar lecturas enviadas por dispositivos autenticados (ESP8266) y procesarlas igual que las simuladas: almacenamiento, notificación en tiempo real y evaluación de reglas. |

---

### SEN-RF-005 – Seleccionar la comunidad de un sensor

| Campo | Descripción |
|--------|-------------|
| **Código** | SEN-RF-005 |
| **Nombre** | Seleccionar la comunidad de un sensor |
| **Módulo** | Gestión de Sensores |
| **Actor** | Administrador |
| **Prioridad** | Media |
| **Descripción** | Al registrar un sensor, la comunidad deberá elegirse de una lista de comunidades activas; al editarlo, deberá conservarse la comunidad actual aunque esté inactiva. |

---

### COM-RF-003 – Seleccionar departamento y municipio

| Campo | Descripción |
|--------|-------------|
| **Código** | COM-RF-003 |
| **Nombre** | Seleccionar departamento y municipio |
| **Módulo** | Gestión de Comunidades |
| **Actor** | Administrador |
| **Prioridad** | Media |
| **Descripción** | Para comunidades de Guatemala, el departamento y el municipio deberán elegirse de un catálogo en cascada; para otros países se escribirán como texto libre. |

---

### REG-RF-001 – Gestionar reglas de alerta

| Campo | Descripción |
|--------|-------------|
| **Código** | REG-RF-001 |
| **Nombre** | Gestionar reglas de alerta |
| **Módulo** | Configuración |
| **Actor** | Administrador |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá permitir crear, editar y activar o desactivar reglas por tipo de sensor con un intervalo de peligro [mínimo, máximo], un nivel de alerta, un tipo de fenómeno y un mensaje. Las reglas heredadas se evaluarán con su semántica original hasta que se conviertan de forma explícita. |

---

### REG-RF-002 – Gestionar tipos de fenómeno

| Campo | Descripción |
|--------|-------------|
| **Código** | REG-RF-002 |
| **Nombre** | Gestionar tipos de fenómeno |
| **Módulo** | Configuración |
| **Actor** | Administrador, Operador |
| **Prioridad** | Media |
| **Descripción** | El sistema deberá permitir crear, editar, activar o desactivar y eliminar los tipos de fenómeno climático asociados a reglas y alertas. |

---

### ALT-RF-005 – Atender alertas

| Campo | Descripción |
|--------|-------------|
| **Código** | ALT-RF-005 |
| **Nombre** | Atender alertas |
| **Módulo** | Gestión de Alertas |
| **Actor** | Administrador, Operador |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá permitir marcar una alerta activa como atendida, registrando al responsable y la fecha. |

---

### REP-RF-001 – Generar reportes PDF

| Campo | Descripción |
|--------|-------------|
| **Código** | REP-RF-001 |
| **Nombre** | Generar reportes PDF |
| **Módulo** | Reportes |
| **Actor** | Administrador |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá generar en el servidor reportes PDF de comunidades, sensores, lecturas, alertas, historial de eventos, estado de sensores, estadísticas climáticas y un reporte ejecutivo, con filtros por comunidad, sensor, tipo, nivel, fenómeno y fechas. |

---

### REP-RF-002 – Consultar y descargar reportes

| Campo | Descripción |
|--------|-------------|
| **Código** | REP-RF-002 |
| **Nombre** | Consultar y descargar reportes |
| **Módulo** | Reportes |
| **Actor** | Administrador |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá conservar el historial de reportes generados (identificador, tipo, autor, fecha, filtros, estado y tamaño) y permitir descargar de nuevo cada PDF. |

---

### REP-RF-003 – Limitar el tamaño de los reportes

| Campo | Descripción |
|--------|-------------|
| **Código** | REP-RF-003 |
| **Nombre** | Limitar el tamaño de los reportes |
| **Módulo** | Reportes |
| **Actor** | Sistema |
| **Prioridad** | Media |
| **Descripción** | El sistema deberá rechazar con un mensaje claro los reportes que superen el número máximo de filas configurado y limitar la cantidad de reportes en proceso simultáneo. |

---

# Requerimientos No Funcionales

## RNF-001 – Usabilidad

| Campo | Descripción |
|--------|-------------|
| **Código** | RNF-001 |
| **Nombre** | Usabilidad |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá presentar una interfaz intuitiva y de fácil utilización para todos los tipos de usuarios definidos. |

---

## RNF-002 – Compatibilidad

| Campo | Descripción |
|--------|-------------|
| **Código** | RNF-002 |
| **Nombre** | Compatibilidad |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá funcionar correctamente en los navegadores Google Chrome, Mozilla Firefox, Microsoft Edge y Safari. |

---

## RNF-003 – Rendimiento

| Campo | Descripción |
|--------|-------------|
| **Código** | RNF-003 |
| **Nombre** | Rendimiento |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá actualizar automáticamente las lecturas y alertas mediante SignalR, manteniendo tiempos de respuesta adecuados para el monitoreo en tiempo real. |

---

## RNF-004 – Seguridad

| Campo | Descripción |
|--------|-------------|
| **Código** | RNF-004 |
| **Nombre** | Seguridad |
| **Prioridad** | Alta |
| **Descripción** | El acceso al sistema deberá realizarse mediante autenticación de usuarios y autorización basada en roles, utilizando tokens JWT para proteger los recursos de la API. |

---

## RNF-005 – Escalabilidad

| Campo | Descripción |
|--------|-------------|
| **Código** | RNF-005 |
| **Nombre** | Escalabilidad |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá permitir incorporar nuevas comunidades y sensores sin requerir modificaciones significativas en la arquitectura de la aplicación. |

---

## RNF-006 – Disponibilidad

| Campo | Descripción |
|--------|-------------|
| **Código** | RNF-006 |
| **Nombre** | Disponibilidad |
| **Prioridad** | Media |
| **Descripción** | El sistema deberá permanecer disponible para consulta mientras el servidor se encuentre operativo. |

---

## RNF-007 – Mantenibilidad

| Campo | Descripción |
|--------|-------------|
| **Código** | RNF-007 |
| **Nombre** | Mantenibilidad |
| **Prioridad** | Media |
| **Descripción** | La solución deberá desarrollarse utilizando una arquitectura en capas que facilite su mantenimiento y evolución. |

---

## RNF-008 – Portabilidad

| Campo | Descripción |
|--------|-------------|
| **Código** | RNF-008 |
| **Nombre** | Portabilidad |
| **Prioridad** | Media |
| **Descripción** | La solución deberá poder desplegarse mediante contenedores Docker Compose en entornos compatibles. |

---

## RNF-009 – Persistencia

| Campo | Descripción |
|--------|-------------|
| **Código** | RNF-009 |
| **Nombre** | Persistencia |
| **Prioridad** | Alta |
| **Descripción** | Toda la información generada por el sistema deberá almacenarse de forma permanente en la base de datos. |

---

## RNF-010 – Diseño Responsivo

| Campo | Descripción |
|--------|-------------|
| **Código** | RNF-010 |
| **Nombre** | Diseño Responsivo |
| **Prioridad** | Media |
| **Descripción** | La interfaz del sistema deberá adaptarse correctamente a diferentes resoluciones de pantalla y dispositivos.

---

## RNF-011 – Despliegue

| Campo | Descripción |
|--------|-------------|
| **Código** | RNF-011 |
| **Nombre** | Despliegue |
| **Prioridad** | Media |
| **Descripción** | El sistema deberá poder desplegarse utilizando Docker Compose, permitiendo reproducir el entorno de ejecución de manera consistente.|

## RNF-012 – Autenticación externa segura

| Campo | Descripción |
|--------|-------------|
| **Código** | RNF-012 |
| **Nombre** | Autenticación externa segura |
| **Prioridad** | Alta |
| **Descripción** | El inicio de sesión con proveedores externos deberá usar Authorization Code con PKCE y `state` (y `nonce` en OpenID Connect), validar el ID Token contra las claves publicadas por el proveedor y no exponer nunca el token de sesión en una URL. |

---

## RNF-013 – Despliegue en Kubernetes

| Campo | Descripción |
|--------|-------------|
| **Código** | RNF-013 |
| **Nombre** | Despliegue en Kubernetes |
| **Prioridad** | Alta |
| **Descripción** | El sistema deberá ejecutarse en Kubernetes con Deployments y Services por componente, acceso por Ingress con HTTPS, configuración en ConfigMaps, secretos en Secrets, almacenamiento persistente para las bases de datos y comprobaciones de salud (startup, liveness y readiness). |

---

## RNF-014 – Aislamiento de datos por servicio

| Campo | Descripción |
|--------|-------------|
| **Código** | RNF-014 |
| **Nombre** | Aislamiento de datos por servicio |
| **Prioridad** | Media |
| **Descripción** | Cada microservicio deberá ser el único con acceso a su base de datos; los demás obtendrán esa información a través de su API. |

---

## RNF-015 – Auditoría

| Campo | Descripción |
|--------|-------------|
| **Código** | RNF-015 |
| **Nombre** | Auditoría |
| **Prioridad** | Media |
| **Descripción** | Las acciones relevantes (inicios de sesión exitosos y fallidos, altas, cambios y eliminaciones) deberán registrarse en la bitácora con usuario, fecha y origen. |

---

## RNF-016 – Integración continua

| Campo | Descripción |
|--------|-------------|
| **Código** | RNF-016 |
| **Nombre** | Integración continua |
| **Prioridad** | Media |
| **Descripción** | Cada cambio en el repositorio deberá compilar y probar automáticamente los servicios y el frontend, validar los manifiestos de despliegue y buscar secretos expuestos. |

---

# Restricciones

| Código | Restricción |
|----------|-------------|
| RES-001 | El frontend deberá desarrollarse utilizando Angular 20 o una versión superior. |
| RES-002 | El backend deberá implementarse utilizando .NET 10 o una versión superior. |
| RES-003 | La base de datos deberá implementarse utilizando SQL Server 2022 o una versión superior. |
| RES-004 | La comunicación entre el cliente y el servidor deberá realizarse mediante una API REST. |
| RES-005 | La solución deberá ejecutarse mediante contenedores Docker Compose. |
| RES-006 | El sistema deberá implementar comunicación en tiempo real utilizando SignalR. |
| RES-007 | Toda la documentación del proyecto deberá desarrollarse en formato Markdown (.md). |
| RES-008 | La autenticación deberá implementarse utilizando JWT. |

> **Estado en ClimGuard 4.1:** RES-002 y RES-003 se cumplen en los servicios .NET (gateway, community, sensor) y en el sensor-service (SQL Server); desde la Fase 3 el sistema usa además NestJS, Spring Boot y FastAPI, y las bases PostgreSQL 16 y MongoDB 7 ([DOC-13](DOC-13-Arquitectura%20de%20Software.md)). RES-005: Docker Compose se usa en desarrollo; en producción, Kubernetes (K3s).

# Supuestos

| Código | Supuesto |
|----------|----------|
| SUP-001 | Los usuarios dispondrán de credenciales válidas para acceder al sistema. |
| SUP-002 | El servidor de despliegue contará con los recursos necesarios para ejecutar Docker, SQL Server y la API. |
| SUP-003 | Los sensores simulados o físicos enviarán información en el formato esperado por la API. |
| SUP-004 | Existirá conectividad de red entre el cliente, el servidor y los dispositivos que transmitan información. |
| SUP-005 | Los navegadores utilizados por los usuarios tendrán habilitado JavaScript. |
| SUP-006 | Los valores recibidos por el sistema corresponderán a variables climáticas previamente definidas y configuradas. |
|SUP-007 | La base de datos deberá encontrarse inicializada con los catálogos necesarios para el funcionamiento del sistema.|

# Dependencias

| Código | Dependencia |
|----------|-------------|
| DEP-001 | Angular 20 (Fases 1-2); Angular 22 en ClimGuard 4.1 |
| DEP-002 | .NET 10 |
| DEP-003 | SQL Server 2022 |
| DEP-004 | SignalR |
| DEP-005 | Docker Compose|
| DEP-006 | Git |
| DEP-007 | GitHub |
| DEP-008 | Navegador web compatible |
| DEP-009 | JWT|
| DEP-010 | PostgreSQL 16 y MongoDB 7 (desde la Fase 3) |
| DEP-011 | NestJS, Spring Boot y FastAPI (desde la Fase 3) |
| DEP-012 | Google y GitHub como proveedores OAuth (Fase 4) |
| DEP-013 | Kubernetes K3s y Traefik (Fase 4, producción) |
| DEP-014 | Dispositivos ESP8266 con conexión a Internet (Fase 4) |

# Criterios Generales de Aceptación

Para considerar que el sistema ClimGuard cumple con la presente especificación de requerimientos, deberá satisfacerse los siguientes criterios generales:

- Todos los requerimientos funcionales especificados deberán encontrarse implementados.
- El acceso al sistema deberá realizarse mediante autenticación de usuarios.
- Cada usuario únicamente podrá acceder a las funcionalidades autorizadas según su rol.
- El sistema deberá registrar y almacenar correctamente las lecturas, alertas y eventos generados.
- El sistema deberá detectar automáticamente condiciones de riesgo utilizando los umbrales configurados.
- La información del dashboard deberá actualizarse en tiempo real.
- El sistema deberá ejecutarse correctamente utilizando contenedores Docker.
- Toda la información deberá persistirse correctamente en la base de datos SQL Server.
- La solución deberá cumplir con los requerimientos no funcionales definidos en este documento.
- El sistema deberá permitir la actualización de los umbrales asociados a cada tipo de sensor.
- El sistema deberá mostrar las alertas generadas en tiempo real mediante SignalR.
- El sistema deberá registrar en la bitácora las acciones realizadas por los usuarios autorizados.
- El sistema deberá ejecutarse correctamente utilizando Docker Compose.