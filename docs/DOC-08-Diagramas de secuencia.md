# ClimGuard
## Diagramas de Secuencia

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Diagramas de Secuencia |
| Código | DOC-08 |
| Versión | 1.0 |
| Estado | Finalizado |

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