# ClimGuard
## Diagrama de Clases

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Diagrama de Clases |
| Código | DOC-09 |
| Versión | 1.0 |
| Estado | En desarrollo |

---

# Objetivo

El presente documento describe el modelo de clases del dominio del sistema ClimGuard, identificando las entidades, catálogos, enumeraciones, atributos, métodos y relaciones que conforman la estructura orientada a objetos de la aplicación.

El diagrama de clases constituye la base para la implementación del sistema, permitiendo representar la organización del dominio y las responsabilidades de cada clase de acuerdo con los principios de orientación a objetos y las reglas de negocio definidas durante la etapa de análisis.

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
    <<enumeration>>
    ACTIVO
    INACTIVO
    MANTENIMIENTO
    FUERA_DE_LINEA
}

class EstadoAlerta{
    <<enumeration>>
    ACTIVA
    ATENDIDA
    CERRADA
}

class NivelRiesgo{
    <<enumeration>>
    NORMAL
    ADVERTENCIA
    CRITICO
}

%%========================
%% ENTIDADES
%%========================

class Usuario{
    +idUsuario:int
    +nombre:String
    +correo:String
    +password:String
    +activo:boolean
}

class Comunidad{
    +idComunidad:int
    +nombre:String
    +descripcion:String
}

class Sensor{
    +idSensor:int
    +codigo:String
    +ubicacion:String
    +latitud:decimal
    +longitud:decimal
    +estado:EstadoSensor
    +fechaInstalacion:Date

    +registrarLectura()
    +evaluarLectura()
    +crearAlerta()
}

class Umbral{
    +idUmbral:int
    +valorAdvertencia:decimal
    +valorCritico:decimal

    +evaluar(valor)
}

class Lectura{
    +idLectura:int
    +valor:decimal
    +fechaHora:DateTime
}

class Alerta{
    +idAlerta:int
    +nivel:NivelRiesgo
    +estado:EstadoAlerta
    +fechaHora:DateTime
    +descripcion:String

    +cerrar()
}

class Notificacion{
    +idNotificacion:int
    +fechaEnvio:DateTime
    +leida:boolean

    +marcarLeida()
}

class Evento{
    +idEvento:int
    +tipo:String
    +descripcion:String
    +fechaHora:DateTime
}

class Bitacora{
    +idBitacora:int
    +accion:String
    +fechaHora:DateTime
}

%%========================
%% RELACIONES
%%========================

Rol "1" <-- "*" Usuario

Usuario "1" --> "*" Bitacora

Comunidad "0..1" --> "*" Sensor : monitorea >

TipoSensor "1" <-- "*" Sensor

Sensor "1" *-- "1" Umbral

Sensor "1" *-- "*" Lectura

Sensor "1" --> "*" Alerta

Alerta "1" --> "*" Notificacion

Alerta "1" --> "1" Evento

Sensor --> EstadoSensor

Alerta --> EstadoAlerta

Alerta --> NivelRiesgo
Usuario "1" --> "*" Notificacion
```

---

# Observaciones

- El diagrama representa únicamente las clases pertenecientes al dominio del negocio.
- Los componentes de infraestructura (Controllers, Services, Repositories, SignalR y Base de Datos) no forman parte de este modelo, ya que corresponden a la arquitectura de software.
- La clase **Sensor** constituye la clase experta (GRASP Expert) del dominio, siendo responsable del registro de lecturas, evaluación de umbrales y creación de alertas.