# ClimGuard
## Diagramas de Secuencia

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Diagramas de Secuencia |
| Código | DOC-08 |
| Versión | 1.0 |
| Estado | En desarrollo |

---

# Objetivo

El presente documento representa la interacción dinámica entre los diferentes componentes del sistema ClimGuard durante la ejecución de los casos de uso principales.

Los diagramas muestran la secuencia de mensajes intercambiados entre actores, componentes del frontend, backend, servicios y base de datos.

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

    AuthService-->>AuthController: JWT + Rol

    AuthController-->>Login: Inicio de sesión exitoso

    Login-->>Usuario: Mostrar Dashboard

else Credenciales inválidas

    AuthService-->>AuthController: Error

    AuthController-->>Login: Credenciales incorrectas

    Login-->>Usuario: Mostrar mensaje

end
```

# DS-002- Gestión administrativa
```mermaid
sequenceDiagram

actor Administrador

participant Vista as Angular Component
participant Controller
participant Service
participant Repository
participant SQL as SQL Server

Administrador->>Vista: Registrar / Modificar / Eliminar

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

actor Operador

participant Config as ConfiguracionComponent
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

# DS-005- Recibir alertas
```mermaid
sequenceDiagram

participant Sensor
participant Controller as LecturaController
participant LecturaService
participant UmbralService
participant AlertaService
participant EventoService
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

    AlertaService->>EventoService: registrarEvento()

    EventoService->>Repository: guardarEvento()

    Repository->>SQL: INSERT Evento

    SQL-->>Repository: OK

    EventoService->>Hub: Notificar

    Hub-->>Usuario: Mostrar alerta

else Lectura normal

    UmbralService-->>LecturaService: Sin alerta

end
```

# DS-006- Reiniciar el sistema de monitoreo
```mermaid
sequenceDiagram

actor Administrador

participant Config as ConfiguracionComponent
participant Controller as ConfiguracionController
participant Service as MonitoreoService
participant Hub as SignalR Hub

Administrador->>Config: Seleccionar "Reiniciar sistema"

Config->>Administrador: Solicitar confirmación

Administrador->>Config: Confirmar reinicio

Config->>Controller: POST /reiniciar

Controller->>Service: reiniciarSistema()

Service->>Service: Reiniciar servicio de monitoreo

alt Reinicio exitoso

    Service->>Hub: Notificar reinicio

    Hub-->>Config: Estado actualizado

    Service-->>Controller: OK

    Controller-->>Config: Confirmación

    Config-->>Administrador: Mostrar mensaje de éxito

else Error durante el reinicio

    Service-->>Controller: Error

    Controller-->>Config: Mostrar error

    Config-->>Administrador: Informar fallo

end
```

# DS-007- Recuperar contraseña
```mermaid
sequenceDiagram

actor Usuario

participant Login as LoginComponent
participant Controller as AuthController
participant Service as AuthService
participant Repository as UsuarioRepository
participant SQL as SQL Server

Usuario->>Login: Seleccionar "¿Olvidó su contraseña?"

Login->>Controller: POST /recuperar

Controller->>Service: recuperarPassword()

Service->>Repository: buscarUsuario()

Repository->>SQL: SELECT Usuario

SQL-->>Repository: Datos

Repository-->>Service: Usuario encontrado

alt Usuario existe

    Service-->>Controller: Recuperación iniciada

    Controller-->>Login: Mostrar confirmación

    Login-->>Usuario: Revisar correo electrónico

else Usuario no existe

    Service-->>Controller: Error

    Controller-->>Login: Usuario no encontrado

    Login-->>Usuario: Mostrar mensaje

end
```

# DS-008- Restablecer contraseña
```mermaid
sequenceDiagram

actor Usuario

participant Login as LoginComponent
participant Controller as AuthController
participant Service as AuthService
participant Repository as UsuarioRepository
participant SQL as SQL Server

Usuario->>Login: Ingresar nueva contraseña

Login->>Controller: POST /restablecer

Controller->>Service: actualizarPassword()

Service->>Service: Validar contraseña

alt Contraseña válida

    Service->>Repository: actualizarPassword()

    Repository->>SQL: UPDATE Usuario

    SQL-->>Repository: Confirmación

    Repository-->>Service: OK

    Service-->>Controller: Actualización exitosa

    Controller-->>Login: Mostrar confirmación

    Login-->>Usuario: Contraseña actualizada

else Contraseña inválida

    Service-->>Controller: Error

    Controller-->>Login: Mostrar validaciones

    Login-->>Usuario: Corregir contraseña

end
```