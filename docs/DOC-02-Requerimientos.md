# ClimGuard
## Sistema Web de Monitoreo y Alerta Temprana para Riesgos Climáticos

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Especificación de Requerimientos |
| Código | DOC-02 |
| Versión | 1.0 |
| Estado | Finalizado |
| Fecha | Agosto 2026 |
| Tecnologías | Angular 20, .NET 10, SQL Server 2022, SignalR, Docker Compose |
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
| DEP-001 | Angular 20 |
| DEP-002 | .NET 10 |
| DEP-003 | SQL Server 2022 |
| DEP-004 | SignalR |
| DEP-005 | Docker Compose|
| DEP-006 | Git |
| DEP-007 | GitHub |
| DEP-008 | Navegador web compatible |
| DEP-009 | JWT|

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