# ClimGuard
## Diagrama de Clases

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Diagrama de Clases |
| Código | DOC-09 |
| Versión | 1.0 |
| Estado | Finalizado |

---

# Objetivo

El presente documento describe el modelo de clases del dominio del sistema ClimGuard, representando las principales entidades, catálogos, atributos y relaciones implementadas en la aplicación.

El diagrama constituye una vista conceptual del dominio y sirve como base para comprender la estructura de los datos y la interacción entre las entidades del sistema.

---

# Diagrama de Clases

```mermaid
classDiagram
direction LR

%%========================
%% CATÁLOGOS
%%========================

class Rol{
    +idRol:int
    +nombre:String
    +descripcion:String
}

class TipoSensor{
    +idTipoSensor:int
    +nombre:String
    +unidadMedida:String
}

%%========================
%% ENUMERACIONES
%%========================

class EstadoSensor{
    +EstadoSensorId:int
    +Estado:String
}

class EstadoAlerta{
    +EstadoAlertaId:int
    +Estado:String
}

%%========================
%% ENTIDADES
%%========================

class Usuario{
    +UsuarioId:int
    +Nombre1:String
    +Nombre2:String
    +Apellido1:String
    +Apellido2:String
    +NombreUsuario:String
    +PasswordHash:String
    +Activo:boolean
}

class Comunidad{
    +ComunidadId:int
    +Nombre:String
    +Latitud:decimal
    +Longitud:decimal
    +Descripcion:String
}

class Sensor{
    +SensorId:int
    +Nombre:String
    +ValorActual:decimal
    +Activo:boolean
    +FechaInstalacion:Date
    +UltimaActualizacion:Date
}

class Umbral{
    +idUmbral:int
    +valorPrecaucion:decimal
    +valorAlerta:decimal
    +valorEmergencia:decimal
}

class Lectura{
    +idLectura:int
    +valor:decimal
    +fechaHora:DateTime
}

class Alerta{
    +AlertaId:int
    +Mensaje:String
    +FechaHora:DateTime
    +FechaResolucion:DateTime
    +Activa:boolean
}

class Notificacion{
    +idNotificacion:int
    +fechaEnvio:DateTime
    +leida:boolean
}

class Bitacora{
    +idBitacora:int
    +accion:String
    +fechaHora:DateTime
}

class NivelAlerta{
    +NivelAlertaId:int
    +Nombre:String
    +ColorHex:String
    +Orden:int
}

class TipoFenomeno{
    +TipoFenomenoId:int
    +Nombre:String
}

%%========================
%% RELACIONES
%%========================

Rol "1" <-- "*" Usuario

Usuario "1" --> "*" Bitacora

Comunidad "1" <-- "0..*" Sensor : monitorea >

TipoSensor "1" <-- "0..*" Sensor

TipoSensor "1" <-- "*" Umbral

Sensor "1" *-- "0..*" Lectura

Sensor "1" <-- "0..*" Alerta

EstadoSensor "1" <-- "*" Sensor

EstadoAlerta "1" <-- "*" Alerta

NivelAlerta "1" <-- "*" Alerta

TipoFenomeno "1" <-- "*" Alerta

Comunidad "1" <-- "*" Alerta
```

---

# Observaciones

- El diagrama representa únicamente las clases pertenecientes al dominio del negocio.
- Los componentes de infraestructura (Controllers, Services, Repositories, SignalR y Base de Datos) no forman parte de este modelo, ya que corresponden a la arquitectura de software.
- Las entidades del dominio representan la información persistida por el sistema. La lógica de negocio asociada a la evaluación de lecturas, generación de alertas y notificaciones se implementa en la capa de servicios del backend.
- Los estados y catálogos del sistema (Rol, TipoSensor, EstadoSensor, EstadoAlerta, NivelAlerta y TipoFenomeno) se representan como clases debido a que son administrados mediante tablas de catálogo en la base de datos.