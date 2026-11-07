# ClimGuard
## Diagramas de Secuencia

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Diagramas de Secuencia |
| Código | DOC-08 |
| Versión | 3.0 |
| Estado | Vigente (ClimGuard 4.1) |

### Historial de versiones
| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | Agosto 2026 | DS-001 a DS-006 sobre la API monolítica de la Fase 2. |
| 3.0 | Noviembre 2026 | DS-007 a DS-009 sobre los microservicios de ClimGuard 4.1. |

> DS-001 a DS-006 muestran los componentes de la API monolítica de la Fase 2 (controladores, servicios y repositorios en un solo proceso, con SQL Server) y se conservan como diseño de esa etapa. Los diagramas vigentes son DS-007 a DS-009.

---

# Objetivo

El presente documento describe la secuencia de interacción entre los actores y los componentes del sistema ClimGuard durante la ejecución de los principales casos de uso implementados.

Cada diagrama muestra el intercambio de mensajes entre la interfaz web, la API REST, los servicios de negocio, el acceso a datos y la base de datos SQL Server.

# DS-001- Acceder al sistema
```mermaid
sequenceDiagram

actor Usuario

participant Login as LoginComponent
participant AuthController
participant AuthService
participant UsuarioRepository
participant SQL as SQL Server

Usuario->>Login: Ingresa usuario y contraseña

Login->>AuthController: POST /login

AuthController->>AuthService: autenticar()

AuthService->>UsuarioRepository: buscarUsuario()

UsuarioRepository->>SQL: Consultar usuario

SQL-->>UsuarioRepository: Datos del usuario

UsuarioRepository-->>AuthService: Usuario encontrado

AuthService->>AuthService: Validar contraseña

alt Credenciales válidas

    AuthService-->>AuthController: Token JWT

    AuthController-->>Login: Inicio de sesión exitoso

    Login-->>Usuario: Mostrar Dashboard

else Credenciales inválidas

    AuthService-->>AuthController: Error

    AuthController-->>Login: Credenciales incorrectas

    Login-->>Usuario: Mostrar mensaje

end
```

# DS-002- Administración de comunidades y sensores
```mermaid
sequenceDiagram

actor Administrador

participant Vista as Angular Component
participant Controller
participant Service
participant Repository
participant SQL as SQL Server

Administrador->>Vista: Registrar / Modificar / Activar / Desactivar

Vista->>Controller: Enviar solicitud

Controller->>Service: Validar información

Service->>Repository: Guardar cambios

Repository->>SQL: INSERT / UPDATE / DELETE

SQL-->>Repository: Confirmación

Repository-->>Service: Operación exitosa

Service-->>Controller: Resultado

Controller-->>Vista: Actualizar listado

Vista-->>Administrador: Mostrar confirmación
```

# DS-003- Configurar umbrales
```mermaid
sequenceDiagram

actor Administrador

participant Config as UmbralesComponent
participant Controller as ConfiguracionController
participant Service as UmbralService
participant Repository as UmbralRepository
participant SQL as SQL Server

Operador->>Config: Modificar umbrales

Config->>Controller: PUT /umbrales

Controller->>Service: actualizarUmbrales()

Service->>Service: Validar reglas de negocio

alt Datos válidos

    Service->>Repository: guardarCambios()

    Repository->>SQL: UPDATE Umbrales

    SQL-->>Repository: Confirmación

    Repository-->>Service: Actualización exitosa

    Service-->>Controller: OK

    Controller-->>Config: Configuración actualizada

    Config-->>Operador: Mostrar confirmación

else Datos inválidos

    Service-->>Controller: Error de validación

    Controller-->>Config: Mostrar errores

    Config-->>Operador: Corregir información

end
```

# DS-004- Monitorear variables climática
```mermaid
sequenceDiagram

actor Usuario

participant Dashboard as DashboardComponent
participant Controller as LecturaController
participant Service as LecturaService
participant Repository as LecturaRepository
participant SQL as SQL Server
participant Hub as SignalR Hub

Usuario->>Dashboard: Seleccionar comunidad

Dashboard->>Controller: GET /lecturas

Controller->>Service: obtenerLecturas()

Service->>Repository: consultarLecturas()

Repository->>SQL: SELECT Lecturas

SQL-->>Repository: Datos

Repository-->>Service: Lecturas

Service-->>Controller: Resultado

Controller-->>Dashboard: Mostrar información

loop Monitoreo continuo

Hub-->>Dashboard: Nueva lectura

Dashboard->>Dashboard: Actualizar indicadores

end
```
# DS-005 – Recibir alertas

```mermaid
sequenceDiagram

participant Sensor
participant Controller as LecturaController
participant LecturaService
participant UmbralService
participant AlertaService
participant Repository
participant SQL as SQL Server
participant Hub as SignalR Hub
actor Usuario

Sensor->>Controller: Enviar lectura
Controller->>LecturaService: registrarLectura()

LecturaService->>Repository: guardarLectura()
Repository->>SQL: INSERT Lectura
SQL-->>Repository: OK
Repository-->>LecturaService: Confirmación

LecturaService->>UmbralService: evaluarLectura()

alt Supera umbral
    UmbralService->>AlertaService: generarAlerta()

    AlertaService->>Repository: guardarAlerta()
    Repository->>SQL: INSERT Alerta
    SQL-->>Repository: OK
    Repository-->>AlertaService: Confirmación

    AlertaService->>Hub: Notificar alerta
    Hub-->>Usuario: Mostrar alerta

else Lectura normal
    UmbralService-->>LecturaService: Sin alerta
end
```

# DS-006 - Consultar bitácora
```mermaid
sequenceDiagram

actor Administrador

participant Vista as BitacoraComponent
participant Controller as BitacoraController
participant Service as BitacoraService
participant Repository as BitacoraRepository
participant SQL as SQL Server

Administrador->>Vista: Accede al módulo de Bitácora
Vista->>Controller: GET /bitacora
Controller->>Service: obtenerRegistros()
Service->>Repository: consultarBitacora()
Repository->>SQL: SELECT Bitacora
SQL-->>Repository: Registros
Repository-->>Service: Resultado
Service-->>Controller: Lista de registros
Controller-->>Vista: Mostrar bitácora
Vista-->>Administrador: Visualizar registros
```

---

# DS-007 – Inicio de sesión con Google (ClimGuard 4.1)
```mermaid
sequenceDiagram
actor U as Usuario
participant W as Angular
participant G as Gateway
participant A as auth-service
participant P as Google
U->>W: Pulsa «Google»
W->>G: GET /api/auth/oauth/google/start
G->>A: reenvía
A-->>W: 302 al proveedor (state, nonce, PKCE) + cookie de enlace
W->>P: Autorización
P-->>W: 302 /api/auth/oauth/google/callback?code&state
W->>G: GET callback
G->>A: reenvía
A->>P: Canje del code (client_secret + code_verifier)
P-->>A: ID Token
A->>A: Valida firma, emisor, audiencia, nonce y correo verificado
A-->>W: 302 /auth/callback#code=<un solo uso>
W->>G: POST /api/auth/oauth/exchange {code}
G->>A: reenvía
A-->>W: Sesión (JWT de ClimGuard)
```

---

# DS-008 – Lectura de un sensor físico y generación de alerta (ClimGuard 4.1)
```mermaid
sequenceDiagram
participant D as ESP8266
participant G as Gateway
participant S as sensor-service
participant DB as SQL Server
participant AL as alert-service
participant H as Hub SignalR
participant W as Angular
D->>G: POST /api/auth/login
G-->>D: token (rol Operador)
D->>G: POST /api/readings (Bearer)
G->>S: reenvía
S->>DB: INSERT lectura
S->>H: LecturaNueva
H-->>W: actualiza el panel
S->>AL: POST /api/alerts/evaluate (X-Internal-Key)
AL->>AL: Reglas activas, mayor nivel, período de espera
AL-->>S: generated, alert
opt alerta generada
S->>H: AlertaNueva
H-->>W: alerta y alarma
end
S-->>D: 200
```

---

# DS-009 – Generación de un reporte PDF (ClimGuard 4.1)
```mermaid
sequenceDiagram
actor A as Administrador
participant W as Angular
participant G as Gateway
participant R as report-service
participant X as community / sensor / alert / audit
participant M as MongoDB (GridFS)
A->>W: Elige tipo y filtros, «Generar PDF»
W->>G: POST /api/reports {type, filters}
G->>R: reenvía
R->>M: registra el reporte (PENDING)
R-->>W: 202 + identificador
R->>X: consulta los datos con el JWT del usuario
R->>R: genera el PDF por partes
R->>M: guarda el PDF y marca COMPLETED
A->>W: «Descargar»
W->>G: GET /api/reports/{id}/download
G->>R: reenvía
R->>M: lee el PDF
R-->>W: application/pdf
```
