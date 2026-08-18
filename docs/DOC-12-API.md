# ClimGuard
## Especificación de la API REST

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Especificación de la API REST |
| Código | DOC-12 |
| Versión | 1.0 |
| Estado | En desarrollo |

---

# Objetivo

El presente documento define el contrato de comunicación entre el cliente (Angular) y el servidor (.NET Web API) del sistema ClimGuard.

Su propósito es establecer los endpoints disponibles, los métodos HTTP utilizados, los parámetros de entrada, los formatos JSON de solicitud y respuesta, así como los códigos de estado esperados.

La presente especificación constituye la referencia oficial para el desarrollo del frontend, backend y pruebas del sistema.

---

# Arquitectura General

```text
Angular
    │
 HTTP / JSON
    │
    ▼
ASP.NET Core Web API
    │
Entity Framework Core
    │
    ▼
SQL Server 2022
```

---

# Convenciones

## URL Base

```
/api
```

---

## Formato de intercambio

- Todas las solicitudes y respuestas utilizarán formato JSON.
- La codificación será UTF-8.
- Las fechas utilizarán el estándar ISO-8601.
- Las coordenadas geográficas se representarán mediante coordenadas decimales.

---

## Respuesta exitosa

```json
{
    "success": true,
    "message": "Operación realizada correctamente.",
    "data": {}
}
```

---

## Respuesta de error

```json
{
    "success": false,
    "message": "Descripción del error.",
    "errors": []
}
```

---

## Códigos HTTP

| Código | Descripción |
|---------|-------------|
|200|Operación realizada correctamente.|
|201|Recurso creado correctamente.|
|400|Solicitud inválida.|
|401|Usuario no autenticado.|
|403|Acceso denegado.|
|404|Recurso no encontrado.|
|500|Error interno del servidor.|

---

# Seguridad

- La autenticación se realizará mediante JSON Web Token (JWT).
- Todos los endpoints requerirán autenticación, excepto el inicio de sesión.
- El acceso a cada recurso dependerá del rol del usuario autenticado.

---

# 1. Autenticación

## 1.1 Iniciar sesión

| Campo | Valor |
|--------|-------|
| Método | **POST** |
| Endpoint | `/api/auth/login` |
| Autenticación | No |
| Roles | Público |
| RF relacionado | AUT-RF-001 |

### Descripción

Permite a un usuario autenticarse en el sistema.

### Request

```json
{
    "correo":"admin@climguard.com",
    "password":"123456"
}
```

### Response (200)

```json
{
    "success": true,
    "message":"Inicio de sesión exitoso.",
    "data":{
        "token":"JWT_TOKEN",
        "usuario":{
            "idUsuario":1,
            "nombre":"Administrador",
            "correo":"admin@climguard.com",
            "rol":"Administrador"
        }
    }
}
```

---

## 1.2 Obtener usuario autenticado

| Campo | Valor |
|--------|-------|
| Método | **GET** |
| Endpoint | `/api/auth/me` |
| Autenticación | Sí |
| Roles | Todos |
| RF relacionado | AUT-RF-001 |

### Response

```json
{
    "success": true,
    "data":{
        "idUsuario":1,
        "nombre":"Administrador",
        "correo":"admin@climguard.com",
        "rol":"Administrador"
    }
}
```

---

# 2. Administración

## 2.1 Usuarios

### Obtener usuarios

| Campo | Valor |
|--------|-------|
| Método | **GET** |
| Endpoint | `/api/usuarios` |
| Autenticación | Sí |
| Roles | Administrador |
| RF relacionado | USR-RF-001 |

### Response

```json
{
    "success":true,
    "data":[
        {
            "idUsuario":1,
            "nombre":"Administrador",
            "correo":"admin@climguard.com",
            "rol":"Administrador",
            "activo":true
        }
    ]
}
```

---

### Obtener usuario

| Campo | Valor |
|--------|-------|
| Método | **GET** |
| Endpoint | `/api/usuarios/{id}` |
| Autenticación | Sí |
| Roles | Administrador |
| RF relacionado | USR-RF-001 |

---

### Crear usuario

| Campo | Valor |
|--------|-------|
| Método | **POST** |
| Endpoint | `/api/usuarios` |
| Autenticación | Sí |
| Roles | Administrador |
| RF relacionado | USR-RF-002 |

### Request

```json
{
    "nombre":"Juan Pérez",
    "correo":"juan@climguard.com",
    "password":"123456",
    "idRol":2
}
```

### Response

```json
{
    "success":true,
    "message":"Usuario creado correctamente."
}
```

---

### Actualizar usuario

| Campo | Valor |
|--------|-------|
| Método | **PUT** |
| Endpoint | `/api/usuarios/{id}` |
| Autenticación | Sí |
| Roles | Administrador |
| RF relacionado | USR-RF-002 |

### Request

```json
{
    "nombre":"Juan Pérez",
    "correo":"juan@climguard.com",
    "idRol":2,
    "activo":true
}
```

---

### Eliminar usuario

| Campo | Valor |
|--------|-------|
| Método | **DELETE** |
| Endpoint | `/api/usuarios/{id}` |
| Autenticación | Sí |
| Roles | Administrador |
| RF relacionado | USR-RF-002 |

---

## 2.2 Comunidades

### Obtener comunidades

| Campo | Valor |
|--------|-------|
| Método | **GET** |
| Endpoint | `/api/comunidades` |
| Autenticación | Sí |
| Roles | Administrador, Operador |
| RF relacionado | ADM-RF-001 |

### Response

```json
{
    "success":true,
    "data":[
        {
            "idComunidad":1,
            "nombre":"San Miguel",
            "descripcion":"Comunidad piloto"
        }
    ]
}
```

---

### Obtener comunidad

GET `/api/comunidades/{id}`

---

### Crear comunidad

POST `/api/comunidades`

```json
{
    "nombre":"San Miguel",
    "descripcion":"Comunidad piloto"
}
```

---

### Actualizar comunidad

PUT `/api/comunidades/{id}`

```json
{
    "nombre":"San Miguel",
    "descripcion":"Descripción actualizada"
}
```

---

### Eliminar comunidad

DELETE `/api/comunidades/{id}`

> Regla de negocio:
> Una comunidad únicamente podrá eliminarse cuando no existan sensores asociados.

---

## 2.3 Sensores

### Obtener sensores

| Campo | Valor |
|--------|-------|
| Método | **GET** |
| Endpoint | `/api/sensores` |
| Autenticación | Sí |
| Roles | Administrador, Operador |
| RF relacionado | ADM-RF-003 |

Filtros opcionales

- idComunidad
- idTipoSensor
- idEstadoSensor

Ejemplo

GET /api/sensores?idComunidad=2

### Response

```json
{
    "success":true,
    "data":[
        {
            "idSensor":1,
            "codigo":"TEMP-001",
            "ubicacion":"Bosque Norte",
            "estado":"ACTIVO",
            "tipoSensor":"Temperatura",
            "comunidad":"San Miguel"
        }
    ]
}
```

---

### Obtener sensor

GET `/api/sensores/{id}`

---

### Crear sensor

POST `/api/sensores`

```json
{
    "codigo":"TEMP-001",
    "ubicacion":"Bosque Norte",
    "latitud":14.628451,
    "longitud":-90.512341,
    "fechaInstalacion":"2026-08-01",
    "idComunidad":null,
    "idTipoSensor":2,
    "idEstadoSensor":1
}
```

---

### Actualizar sensor

PUT `/api/sensores/{id}`

---

### Eliminar sensor

DELETE `/api/sensores/{id}`

> Regla de negocio:
> Un sensor únicamente podrá eliminarse cuando no posea lecturas ni alertas asociadas.

---

## 2.4 Umbrales

### Obtener umbrales

GET `/api/umbrales`

Filtros:

- idSensor

---

### Obtener umbral

GET `/api/umbrales/{id}`

---

### Crear umbral

POST `/api/umbrales`

```json
{
    "idSensor":1,
    "idTipoComparacion":2,
    "idTipoAlerta":1,
    "valorPrecaucion":5,
    "valorAlerta":0,
    "valorEmergencia":-5
}
```

---

### Actualizar umbral

PUT `/api/umbrales/{id}`

---

### Eliminar umbral

DELETE `/api/umbrales/{id}`

> Regla de negocio:
> Cada sensor únicamente podrá poseer un umbral activo.

# 3. Monitoreo

El módulo de monitoreo concentra las operaciones relacionadas con la recepción de lecturas provenientes de los sensores, la generación automática de alertas y la consulta de la información presentada en el Dashboard.

---

## 3.1 Lecturas

### 3.1.1 Registrar lectura

| Campo | Valor |
|--------|-------|
| Método | **POST** |
| Endpoint | `/api/lecturas` |
| Autenticación | Sí |
| Roles | Administrador |
| RF relacionado | MON-RF-001 |

### Descripción

Registra una nueva lectura proveniente de un sensor. Una vez almacenada la lectura, el sistema evaluará automáticamente los umbrales configurados para determinar si debe generarse una alerta.

### Request

```json
{
    "idSensor": 3,
    "valor": 32.5
}
```

### Response (201)

```json
{
    "success": true,
    "message": "Lectura registrada correctamente."
}
```

---

### 3.1.2 Consultar lecturas

| Campo | Valor |
|--------|-------|
| Método | **GET** |
| Endpoint | `/api/lecturas` |
| Autenticación | Sí |
| Roles | Administrador, Operador |
| RF relacionado | MON-RF-002 |

### Parámetros de consulta (Opcionales)

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| idSensor | INT | Filtra por sensor. |
| fechaInicio | DATE | Fecha inicial. |
| fechaFin | DATE | Fecha final. |

### Ejemplo

```http
GET /api/lecturas?idSensor=3&fechaInicio=2026-08-01&fechaFin=2026-08-31
```

### Response (200)

```json
{
    "success": true,
    "data": [
        {
            "idLectura": 125,
            "sensor": "TEMP-001",
            "valor": 32.5,
            "fechaHora": "2026-08-20T10:35:18"
        }
    ]
}
```

---

### 3.1.3 Obtener detalle de lectura

| Campo | Valor |
|--------|-------|
| Método | **GET** |
| Endpoint | `/api/lecturas/{id}` |
| Autenticación | Sí |
| Roles | Administrador, Operador |
| RF relacionado | MON-RF-002 |

---

## 3.2 Alertas

### 3.2.1 Consultar alertas

| Campo | Valor |
|--------|-------|
| Método | **GET** |
| Endpoint | `/api/alertas` |
| Autenticación | Sí |
| Roles | Administrador, Operador |
| RF relacionado | ALT-RF-001 |

### Parámetros de consulta (Opcionales)

| Parámetro | Tipo |
|-----------|------|
| idComunidad | INT |
| idNivelRiesgo | INT |
| idEstadoAlerta | INT |
| fechaInicio | DATE |
| fechaFin | DATE |

### Response (200)

```json
{
    "success": true,
    "data": [
        {
            "idAlerta": 18,
            "sensor": "TEMP-001",
            "tipoAlerta": "Incendio Forestal",
            "nivel": "EMERGENCIA",
            "estado": "ACTIVA",
            "fechaHora": "2026-08-20T11:22:14"
        }
    ]
}
```

---

### 3.2.2 Obtener alerta

| Campo | Valor |
|--------|-------|
| Método | **GET** |
| Endpoint | `/api/alertas/{id}` |
| Autenticación | Sí |
| Roles | Administrador, Operador |
| RF relacionado | ALT-RF-001 |

---

### 3.2.3 Atender alerta

| Campo | Valor |
|--------|-------|
| Método | **PUT** |
| Endpoint | `/api/alertas/{id}/atender` |
| Autenticación | Sí |
| Roles | Operador |
| RF relacionado | ALT-RF-003 |

### Response

```json
{
    "success": true,
    "message": "La alerta fue marcada como atendida."
}
```

---

### 3.2.4 Cerrar alerta

| Campo | Valor |
|--------|-------|
| Método | **PUT** |
| Endpoint | `/api/alertas/{id}/cerrar` |
| Autenticación | Sí |
| Roles | Operador |
| RF relacionado | ALT-RF-004 |

### Response

```json
{
    "success": true,
    "message": "La alerta fue cerrada correctamente."
}
```

---

> **Regla de negocio:** Las alertas son generadas automáticamente por el sistema al detectar que una lectura supera los umbrales configurados. No existe un endpoint para crear alertas manualmente.

---

## 3.3 Dashboard

### 3.3.1 Obtener resumen general

| Campo | Valor |
|--------|-------|
| Método | **GET** |
| Endpoint | `/api/dashboard` |
| Autenticación | Sí |
| Roles | Administrador, Operador |
| RF relacionado | MON-RF-003 |

### Response

```json
{
    "success": true,
    "data": {
        "sensoresActivos": 24,
        "alertasActivas": 3,
        "comunidades": 8,
        "ultimaLectura": "2026-08-20T11:35:42"
    }
}
```

---

### 3.3.2 Obtener evolución de lecturas

| Campo | Valor |
|--------|-------|
| Método | **GET** |
| Endpoint | `/api/dashboard/evolucion` |
| Autenticación | Sí |
| Roles | Administrador, Operador |
| RF relacionado | MON-RF-003 |

### Parámetros de consulta

| Parámetro | Tipo |
|-----------|------|
| idSensor | INT |
| fechaInicio | DATE |
| fechaFin | DATE |

### Response

```json
{
    "success": true,
    "data": [
        {
            "fechaHora": "2026-08-20T10:00:00",
            "valor": 28.3
        },
        {
            "fechaHora": "2026-08-20T11:00:00",
            "valor": 29.6
        }
    ]
}
```
# 4. Auditoría

El módulo de auditoría permite consultar las acciones realizadas por los usuarios dentro del sistema.

La bitácora es generada automáticamente por la aplicación y no podrá modificarse manualmente.

---

## 4.1 Bitácora

### 4.1.1 Consultar bitácora

| Campo | Valor |
|--------|-------|
| Método | **GET** |
| Endpoint | `/api/bitacora` |
| Autenticación | Sí |
| Roles | Administrador |
| RF relacionado | USR-RF-003 |

### Descripción

Obtiene el historial de acciones registradas por el sistema.

### Parámetros de consulta (Opcionales)

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| idUsuario | INT | Filtra por usuario. |
| fechaInicio | DATE | Fecha inicial del rango. |
| fechaFin | DATE | Fecha final del rango. |

### Ejemplo

```http
GET /api/bitacora?idUsuario=2&fechaInicio=2026-08-01&fechaFin=2026-08-31
```

### Response (200)

```json
{
    "success": true,
    "data": [
        {
            "idBitacora": 15,
            "usuario": "Administrador",
            "accion": "Creó un sensor.",
            "fechaHora": "2026-08-20T09:15:44"
        },
        {
            "idBitacora": 16,
            "usuario": "Administrador",
            "accion": "Actualizó un umbral.",
            "fechaHora": "2026-08-20T09:48:12"
        }
    ]
}
```

> **Regla de negocio:** La bitácora es generada automáticamente por el sistema. No existen endpoints para crear, modificar o eliminar registros.

---

# Observaciones

- El presente documento constituye el contrato oficial de comunicación entre el frontend y el backend.
- Toda modificación a la estructura de solicitudes, respuestas o endpoints deberá actualizarse previamente en este documento.
- Los modelos de datos utilizados por la API deberán ser consistentes con el Diagrama de Clases (DOC-09) y el Modelo de Base de Datos (DOC-10).
- Los nombres de los endpoints se definieron siguiendo principios REST.
- Las respuestas de la API utilizarán JSON como formato de intercambio.
- Los códigos HTTP deberán emplearse conforme a su significado estándar.

---

# Consideraciones de Implementación

- La API será desarrollada utilizando ASP.NET Core Web API.
- La persistencia de datos será implementada mediante Entity Framework Core sobre SQL Server 2022.
- La autenticación se realizará mediante JSON Web Token (JWT).
- El acceso a los recursos será controlado mediante roles.
- La validación de los datos de entrada deberá realizarse tanto en el cliente como en el servidor.
- Las alertas serán generadas automáticamente por el sistema al evaluar las lecturas registradas contra los umbrales configurados.
- La documentación de la API podrá complementarse mediante Swagger/OpenAPI durante la etapa de desarrollo.

---