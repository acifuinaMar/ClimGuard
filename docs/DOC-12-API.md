# ClimGuard
## Especificación de la API REST

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Especificación de la API REST |
| Código | DOC-12 |
| Versión | 3.0 |
| Estado | Vigente (ClimGuard 4.1) |

### Historial de versiones
| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 – 2.0 | Agosto – octubre 2026 | API del monolito de la Fase 2 (`/api/comunidades`, `/api/sensores`, `/api/ReglaAlerta`, …). Consultable en la etiqueta `fase2-main-final` y en [fases/fase-1-2/api-docx](fases/fase-1-2/api-docx/). |
| 3.0 | Noviembre 2026 | Reescrito para los microservicios de la Fase 3/4: rutas, permisos y contratos verificados contra los controladores de cada servicio; OAuth 2.0 / OIDC. |

---

# Objetivo
Describir los endpoints públicos de ClimGuard 4.1 tal como los implementa cada microservicio y los expone el API Gateway.

# Convenciones

## URL base
| Entorno | URL |
|---|---|
| Producción | `https://climguard.acifuina.online/api` |
| Local (Docker Compose) | `https://localhost:8443/api` |

Todas las peticiones pasan por el **gateway** (YARP), que reenvía cada prefijo a su servicio. Los servicios no son accesibles directamente desde fuera.

## Autenticación
- Encabezado `Authorization: Bearer <JWT>` en todas las rutas salvo las marcadas como **pública**.
- El JWT (HS256) lo emite el auth-service. Contiene `sub` (id de usuario), `preferred_username`, `role` (`Administrador`, `Operador` o `Consulta`) y `permissions`.
- El gateway rechaza con **401** las rutas protegidas sin token válido; cada servicio vuelve a validar el token y aplica su propia autorización (**403** si el rol o permiso no alcanza).

**Columna «Acceso»** en las tablas: *pública*; *autenticado* (cualquier rol); un **rol** (`Administrador`; `Operador` = Operador o Administrador); o un **permiso** del JWT (por ejemplo `reports.generate`).

| Permiso (JWT) | Administrador | Operador | Consulta |
|---|:-:|:-:|:-:|
| `dashboard.view` | ✔ | ✔ | ✔ |
| `audit.write` | ✔ | ✔ | ✔ |
| `reports.generate`, `reports.download`, `reports.history` | ✔ | | |
| `audit.read` | ✔ | | |
| `users.manage` | ✔ | | |

## Formato y paginación
- JSON en UTF-8 (`Content-Type: application/json`); fechas en ISO 8601 (UTC).
- Los listados paginados aceptan `page` y `pageSize` y devuelven el total en el encabezado **`X-Total-Count`**.

## Límites de peticiones (gateway, por IP y por minuto)
| Política | Rutas | Límite |
|---|---|---|
| `login` | `POST /api/auth/login`, `POST /api/login` | 10 |
| `oauth` | rutas públicas de OAuth | 30 |
| general | resto | 300 |

Al superarlo, el gateway responde **429**.

## Códigos HTTP
| Código | Significado en ClimGuard |
|---|---|
| 200 / 201 / 202 / 204 | Correcto / creado / aceptado (reporte en cola) / sin contenido |
| 400 | Datos inválidos (el cuerpo trae el detalle) |
| 401 | Sin token, token vencido o credenciales incorrectas |
| 403 | El rol o permiso no permite la operación |
| 404 | Recurso inexistente |
| 409 | Conflicto (por ejemplo, eliminar una comunidad con sensores) |
| 422 | Reporte que supera el límite de filas (`LIMIT_EXCEEDED`) |
| 429 | Límite de peticiones o cola de reportes llena (`Retry-After`) |
| 502 / 503 | Un servicio dependiente no respondió / el servicio no está listo |

---

# 1. Autenticación y usuarios — auth-service

## 1.1 Inicio de sesión local
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | pública | Inicia sesión con usuario y contraseña |
| POST | `/api/login` | pública | Alias de compatibilidad con la Fase 2 (mismo contrato) |
| GET | `/api/auth/me` | autenticado | Datos del usuario del token |
| POST | `/api/auth/logout` | autenticado | Registra el cierre de sesión (204) |

**Request**
```json
{ "username": "<usuario>", "password": "<contraseña>" }
```
También se aceptan los nombres `nombreUsuario` y `contraseña` (compatibilidad con la Fase 2).

**Response 200**
```json
{
  "usuarioId": 7,
  "usuario": "<usuario>",
  "token": "<JWT>",
  "mensaje": "Inicio de sesión correcto.",
  "rol": "Operador",
  "permissions": ["dashboard.view", "audit.write"],
  "expiresAt": "2026-11-06T18:30:00.000Z"
}
```
**Response 401**: `usuarioId: 0`, `token: ""` y `mensaje: "Usuario o contraseña incorrectos."`.

> Este contrato lo usa el dispositivo ESP8266 (requiere HTTP 200, `rol` y `token`). No debe cambiarse sin actualizar el firmware.

## 1.2 OAuth 2.0 / OIDC (Google y GitHub)
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/auth/oauth/providers` | pública | Proveedores configurados: `{"providers":[{"id":"google","label":"Google"}, …]}` |
| GET | `/api/auth/oauth/{proveedor}/start` | pública | Redirige (302) a Google o GitHub con `state`, PKCE y, en Google, `nonce` |
| GET | `/api/auth/oauth/{proveedor}/callback` | pública | Retorno del proveedor; redirige a `/auth/callback#code=<código de un solo uso>` o a `/login?oauth_error=<motivo>` |
| POST | `/api/auth/oauth/exchange` | pública | Canjea `{"code": "..."}` por la sesión (mismo formato que el login local, más `nombreCompleto`) |
| POST | `/api/auth/oauth/{proveedor}/link` | autenticado | Inicia la vinculación de una cuenta externa al usuario de la sesión |

`{proveedor}`: `google` o `github`. El JWT nunca viaja en la URL; el código de canje dura 60 s, se usa una sola vez y queda ligado al navegador que inició el flujo (cookie `httpOnly`). Motivos de error: `not_registered`, `account_disabled`, `email_not_verified`, `domain_not_allowed`, `identity_in_use`, `invalid_state`, `invalid_token`, `provider_error`, `provider_unavailable`, `unknown_provider`. Diseño completo: [FASE4_CAMBIOS.md](fases/fase-4/FASE4_CAMBIOS.md).

## 1.3 Usuarios
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/users` | `users.manage` | Lista de usuarios |
| GET | `/api/users/{id}` | `users.manage` | Un usuario |
| POST | `/api/users` | `users.manage` | Crea un usuario |
| PUT | `/api/users/{id}` | `users.manage` | Modifica un usuario (y su contraseña si se envía) |
| DELETE | `/api/users/{id}` | `users.manage` | Elimina un usuario (204) |

`/api/Usuario` y `/api/Usuario/{id}` son alias de compatibilidad.

**Request (POST / PUT)**
```json
{ "nombreCompleto": "Ana López", "nombreUsuario": "alopez", "password": "<contraseña>", "rolId": 2, "activo": true }
```
`rolId`: 1 Administrador, 2 Operador, 3 Consulta. Las contraseñas se guardan con scrypt y sal.

---

# 2. Comunidades — community-service

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/communities?activo=&q=&page=1&pageSize=100` | autenticado | Lista (filtro por estado y texto; `X-Total-Count`) |
| GET | `/api/communities/{id}` | autenticado | Una comunidad |
| POST | `/api/communities` | Administrador | Crea |
| PUT | `/api/communities/{id}` | Administrador | Modifica |
| DELETE | `/api/communities/{id}` | Administrador | Elimina; **409** si tiene sensores asociados |

**Request (POST / PUT)**
```json
{ "nombreComunidad": "San Juan Sacatepéquez", "descripcion": "Zona de ladera", "pais": "Guatemala",
  "departamento": "Guatemala", "municipio": "San Juan Sacatepéquez", "latitud": 14.7189, "longitud": -90.6442, "activo": true }
```

---

# 3. Sensores y lecturas — sensor-service

## 3.1 Sensores
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/sensors?comunidadId=&tipoSensorId=&estadoSensorId=&origen=&page=1&pageSize=100` | autenticado | Lista (`X-Total-Count`) |
| GET | `/api/sensors/{id}` | autenticado | Un sensor |
| POST | `/api/sensors` | Administrador | Crea (sin `origen` se registra como `FISICO`) |
| PUT | `/api/sensors/{id}` | Administrador | Modifica (sin `origen` no lo cambia) |
| DELETE | `/api/sensors/{id}` | Administrador | Elimina |

**Request (POST / PUT)**
```json
{ "nombre": "Temperatura San Juan", "codigo": "TMP-001", "ubicacion": "Plaza central", "descripcion": "Temperatura ambiente",
  "fechaInstalacion": "2026-05-01T00:00:00Z", "comunidadId": 1, "tipoSensorId": 1, "estadoSensorId": 1, "origen": "SIMULADO" }
```
`origen`: `FISICO` (las lecturas las envía el dispositivo) o `SIMULADO` (las genera el simulador mientras el sensor esté activo).

## 3.2 Lecturas
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/readings?sensorId=&comunidadId=&tipoSensorId=&desde=&hasta=&page=1&pageSize=500` | autenticado | Historial (`X-Total-Count`) |
| GET | `/api/readings/stats?comunidadId=&desde=&hasta=` | autenticado | Cantidad, promedio, mínimo, máximo y suma por tipo de sensor |
| POST | `/api/readings` | Operador | Registra una lectura (la usa el ESP8266) |

**Request (POST)**
```json
{ "sensorId": 5, "valor": 24.57, "fechaHora": "2026-11-06T02:13:41Z" }
```
`fechaHora` es opcional (por defecto, la hora del servidor). Cada lectura se guarda, se envía por SignalR y se evalúa contra las reglas de alerta.

## 3.3 Catálogos y simulación
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/sensor-types` | autenticado | Tipos de sensor (variable y unidad) |
| GET | `/api/sensor-states` | autenticado | Estados del sensor (Activo, Inactivo, Mantenimiento, Fuera de línea) |
| GET | `/api/simulation` | autenticado | `{"enabled": true}` |
| POST | `/api/simulation/start` · `/api/simulation/stop` | Administrador | Enciende o apaga el simulador (hasta el siguiente reinicio del servicio) |

## 3.4 Tiempo real (SignalR)
| Hub | Acceso | Eventos |
|---|---|---|
| `/hubs/monitoreo` | autenticado (token en `access_token` de la conexión) | `LecturaNueva` (cada lectura), `AlertaNueva` (cada alerta generada) |

---

# 4. Reglas, alertas y catálogos — alert-service

## 4.1 Reglas de alerta
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/rules` | autenticado | Todas las reglas (incluye `requiereRevision`) |
| POST | `/api/rules` | Administrador | Crea (siempre con la semántica de intervalo) |
| PUT | `/api/rules/{id}?convertirSemantica=false` | Administrador | Modifica; con `convertirSemantica=true` convierte una regla legada |
| DELETE | `/api/rules/{id}` | Administrador | Elimina (204) |
| GET | `/api/rules/classify?tipoSensorId=&valor=` | autenticado | Nivel de peligro de un valor, sin crear alertas |
| GET | `/api/rules/pending-review` | autenticado | Reglas legadas pendientes de convertir |

**Request (POST / PUT)**
```json
{ "nombre": "Temperatura elevada", "tipoSensorId": 1, "valorMin": 35, "valorMax": 100,
  "nivelAlertaId": 4, "tipoFenomenoId": 1, "mensaje": "Temperatura extrema", "activo": true }
```
Semántica: la regla se activa si `valorMin ≤ valor ≤ valorMax` (extremos incluidos). Las reglas legadas (`requiereRevision = true`) se siguen evaluando como antes: alerta **fuera** de `[valorMin, valorMax]` ([MIGRACIONES.md](MIGRACIONES.md) §2).

## 4.2 Alertas y eventos
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/alerts?comunidadId=&sensorId=&nivelAlertaId=&tipoFenomenoId=&estadoAlertaId=&activo=&desde=&hasta=&page=&pageSize=` | autenticado | Alertas (`X-Total-Count`) |
| GET | `/api/alerts/{id}` | autenticado | Una alerta |
| GET | `/api/alerts/events?comunidadId=&sensorId=&nivelAlertaId=&tipoFenomenoId=&desde=&hasta=&page=&pageSize=` | autenticado | Historial de eventos |
| GET | `/api/alerts/stats?comunidadId=&desde=&hasta=` | autenticado | Estadísticas de alertas |
| POST | `/api/alerts/{id}/attend` | Operador | Pasa la alerta a *Atendida* |
| POST | `/api/alerts/{id}/close` | Operador | Pasa la alerta a *Cerrada* |
| POST | `/api/alerts/evaluate` | interno (`X-Internal-Key`) u Operador | Evalúa una lectura; responde `generated`, `alert`, `condicionPeligro` y `suprimidaPorCooldown` |

## 4.3 Catálogos
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/levels` | autenticado | Niveles de alerta |
| GET | `/api/alert-states` | autenticado | Estados de alerta (Activa, Atendida, Cerrada) |
| GET | `/api/phenomena` | autenticado | Tipos de fenómeno |
| POST | `/api/phenomena` | Operador | Crea un tipo de fenómeno (`{"nombre": "Helada", "activo": true}`) |
| PUT | `/api/phenomena/{id}` | Operador | Modifica |
| DELETE | `/api/phenomena/{id}` | Operador | Elimina (204) |

---

# 5. Reportes — report-service

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/reports/types` | autenticado | Tipos disponibles y sus filtros |
| POST | `/api/reports` | `reports.generate` | Encola un reporte → **202** con metadatos y `Location`; con `?sync=true` (requiere también `reports.download`) devuelve el PDF |
| GET | `/api/reports/{id}` | `reports.history` | Estado y metadatos (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`) |
| GET | `/api/reports/{id}/download` | `reports.download` | Descarga el PDF (GridFS) |
| GET | `/api/reports/history?page=1&pageSize=20` | `reports.history` | Historial (`X-Total-Count`) |
| GET | `/api/reports/dashboard?comunidadId=` | `dashboard.view` | Indicadores del panel |
| POST | `/api/reports/{tipo}` | `reports.generate` + `reports.download` | Ruta de compatibilidad: genera y devuelve el PDF de forma síncrona |

**Request (POST /api/reports)**
```json
{ "type": "READINGS", "filters": { "sensorId": 5, "from": "2026-11-01", "to": "2026-11-05" } }
```

| `type` | Filtros admitidos |
|---|---|
| `COMMUNITIES` | `activo` |
| `SENSORS` | `comunidadId`, `tipoSensorId`, `estadoSensorId` |
| `READINGS` | `sensorId`, `comunidadId`, `tipoSensorId`, `from`, `to` (sin rango: último día) |
| `ALERTS` | `comunidadId`, `sensorId`, `nivelAlertaId`, `tipoFenomenoId`, `estadoAlertaId`, `from`, `to` |
| `EVENT_HISTORY` | `comunidadId`, `tipoFenomenoId`, `from`, `to` |
| `SENSOR_STATUS` | `comunidadId` |
| `CLIMATE_STATS` | `comunidadId`, `from`, `to` |
| `EXECUTIVE` | `comunidadId`, `from`, `to` |

Si el reporte supera `REPORT_MAX_ROWS` responde **422** con `errorCode: LIMIT_EXCEEDED`, el límite y el total; con la cola llena, **429** con `Retry-After`.

---

# 6. Bitácora — audit-service

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/audit` | interno (`X-Internal-Key`) o autenticado | Registra un evento (`201`) |
| GET | `/api/audit?page=&pageSize=` | `audit.read` | Eventos de auditoría (`X-Total-Count`) |
| GET | `/api/audit/bitacora?limit=200` | `audit.read` | Últimas acciones en el formato de la pantalla Bitácora |

---

# 7. Salud de los servicios
Cada servicio expone `GET /health` y `GET /ready` dentro del clúster (no a través del gateway). Kubernetes los usa como *startup*, *liveness* y *readiness probes*.
