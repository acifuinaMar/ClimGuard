IF DB_ID('MonitoreoClimatico') IS NOT NULL
BEGIN
    ALTER DATABASE MonitoreoClimatico
    SET SINGLE_USER
    WITH ROLLBACK IMMEDIATE;

    DROP DATABASE MonitoreoClimatico;
END
GO

CREATE DATABASE MonitoreoClimatico;
GO

USE MonitoreoClimatico;
GO

/*==============================================================*/
/* CATÁLOGO: ROL                                                 */
/*==============================================================*/

CREATE TABLE Rol
(
    RolId INT IDENTITY(1,1) PRIMARY KEY,

    Nombre NVARCHAR(50) NOT NULL,

    Activo BIT NOT NULL
        CONSTRAINT DF_Rol_Activo
        DEFAULT (1),

    UsuarioIng INT NOT NULL,

    FechaIng DATETIME2 NOT NULL
        CONSTRAINT DF_Rol_FechaIng
        DEFAULT (GETDATE()),

    UsuarioAct INT NULL,

    FechaAct DATETIME2 NULL,

    CONSTRAINT UQ_Rol_Nombre
        UNIQUE (Nombre)
);
GO

/*
    SEEDS PARA CATÁLOGO ROL
*/
INSERT INTO Rol
(
    Nombre,
    UsuarioIng
)
VALUES
('Administrador',1),
('Operador',1),
('Consulta',1);
GO

/*==============================================================*/
/* CATÁLOGO: TIPOSENSOR                                                 */
/*==============================================================*/
CREATE TABLE TipoSensor
(
    TipoSensorId INT IDENTITY(1,1) PRIMARY KEY,

    Nombre NVARCHAR(100) NOT NULL,

    UnidadMedida NVARCHAR(30) NOT NULL,

    Activo BIT NOT NULL
        CONSTRAINT DF_TipoSensor_Activo
        DEFAULT(1),

    UsuarioIng INT NOT NULL,

    FechaIng DATETIME2 NOT NULL
        DEFAULT(GETDATE()),

    UsuarioAct INT NULL,

    FechaAct DATETIME2 NULL,

    CONSTRAINT UQ_TipoSensor_Nombre
        UNIQUE(Nombre)
);
GO

/*==============================================================*/
/* SEEDS PARA TIPOSENSOR                                                 */
/*==============================================================*/
INSERT INTO TipoSensor
(
    Nombre,
    UnidadMedida,
    UsuarioIng
)
VALUES
('Temperatura','°C',1),
('Humedad','%',1),
('Velocidad del viento','km/h',1),
('Lluvia','mm',1),
('Nivel de río','m',1),
('Nivel de reservorio','m',1),
('Humo / Incendio','ppm',1),
('Otro','-',1);
GO

/*==============================================================*/
/* CATÁLOGO: TIPO FENÓMENO                                      */
/*==============================================================*/

CREATE TABLE TipoFenomeno
(
    TipoFenomenoId INT IDENTITY(1,1) PRIMARY KEY,

    Nombre NVARCHAR(100) NOT NULL,

    Activo BIT NOT NULL
        CONSTRAINT DF_TipoFenomeno_Activo
        DEFAULT (1),

    UsuarioIng INT NOT NULL,

    FechaIng DATETIME2 NOT NULL
        CONSTRAINT DF_TipoFenomeno_FechaIng
        DEFAULT (GETDATE()),

    UsuarioAct INT NULL,

    FechaAct DATETIME2 NULL,

    CONSTRAINT UQ_TipoFenomeno_Nombre
        UNIQUE (Nombre)
);
GO

/*==============================================================*/
/* SEEDS DE TIPO FENÓMENO                                       */
/*==============================================================*/
INSERT INTO TipoFenomeno
(
    Nombre,
    UsuarioIng
)
VALUES
('Inundación',1),
('Sequía',1),
('Tormenta',1),
('Helada',1),
('Incendio Forestal',1);
GO

/*==============================================================*/
/* CATÁLOGO: NIVEL ALERTA                                       */
/*==============================================================*/

CREATE TABLE NivelAlerta
(
    NivelAlertaId INT IDENTITY(1,1) PRIMARY KEY,

    Nombre NVARCHAR(50) NOT NULL,

    ColorHex CHAR(7) NOT NULL,

    Activo BIT NOT NULL
        CONSTRAINT DF_NivelAlerta_Activo
        DEFAULT (1),

    UsuarioIng INT NOT NULL,

    FechaIng DATETIME2 NOT NULL
        CONSTRAINT DF_NivelAlerta_FechaIng
        DEFAULT (GETDATE()),

    UsuarioAct INT NULL,

    FechaAct DATETIME2 NULL,

    CONSTRAINT UQ_NivelAlerta_Nombre
        UNIQUE (Nombre)
);
GO

/*==============================================================*/
/* SEEDS DE NIVELALERTA                                         */
/*==============================================================*/
INSERT INTO NivelAlerta
(
    Nombre,
    ColorHex,
    UsuarioIng
)
VALUES
('Normal','#28A745',1),
('Precaución','#FFC107',1),
('Alerta','#FD7E14',1),
('Emergencia','#DC3545',1);
GO

/*==============================================================*/
/* CATÁLOGO: ESTADO ALERTA                                      */
/*==============================================================*/

CREATE TABLE EstadoAlerta
(
    EstadoAlertaId INT IDENTITY(1,1) PRIMARY KEY,

    Nombre NVARCHAR(50) NOT NULL,

    Activo BIT NOT NULL
        CONSTRAINT DF_EstadoAlerta_Activo
        DEFAULT (1),

    UsuarioIng INT NOT NULL,

    FechaIng DATETIME2 NOT NULL
        CONSTRAINT DF_EstadoAlerta_FechaIng
        DEFAULT (GETDATE()),

    UsuarioAct INT NULL,

    FechaAct DATETIME2 NULL,

    CONSTRAINT UQ_EstadoAlerta_Nombre
        UNIQUE (Nombre)
);
GO

/*==============================================================*/
/* SEEDS DE ESTADOALERTA                                        */
/*==============================================================*/
INSERT INTO EstadoAlerta
(
    Nombre,
    UsuarioIng
)
VALUES
('Activa',1),
('Atendida',1),
('Cerrada',1);
GO

/*==============================================================*/
/* CATÁLOGO: ESTADO SENSOR                                      */
/*==============================================================*/

CREATE TABLE EstadoSensor
(
    EstadoSensorId INT IDENTITY(1,1) PRIMARY KEY,

    Nombre NVARCHAR(50) NOT NULL,

    Activo BIT NOT NULL
        CONSTRAINT DF_EstadoSensor_Activo
        DEFAULT (1),

    UsuarioIng INT NOT NULL,

    FechaIng DATETIME2 NOT NULL
        CONSTRAINT DF_EstadoSensor_FechaIng
        DEFAULT (GETDATE()),

    UsuarioAct INT NULL,

    FechaAct DATETIME2 NULL,

    CONSTRAINT UQ_EstadoSensor_Nombre
        UNIQUE (Nombre)
);
GO

/*==============================================================*/
/* SEEDS DE ESTADOSENSOR                                        */
/*==============================================================*/
INSERT INTO EstadoSensor
(
    Nombre,
    UsuarioIng
)
VALUES
('Activo',1),
('Inactivo',1),
('Mantenimiento',1),
('Fuera de línea',1);
GO

/*==============================================================*/
/* CATÁLOGO: TIPO EVENTO                                        */
/*==============================================================*/

CREATE TABLE TipoEvento
(
    TipoEventoId INT IDENTITY(1,1) PRIMARY KEY,

    Nombre NVARCHAR(100) NOT NULL,

    Activo BIT NOT NULL
        CONSTRAINT DF_TipoEvento_Activo
        DEFAULT (1),

    UsuarioIng INT NOT NULL,

    FechaIng DATETIME2 NOT NULL
        CONSTRAINT DF_TipoEvento_FechaIng
        DEFAULT (GETDATE()),

    UsuarioAct INT NULL,

    FechaAct DATETIME2 NULL,

    CONSTRAINT UQ_TipoEvento_Nombre
        UNIQUE (Nombre)
);
GO

/*==============================================================*/
/* SEEDS DE TIPOEVENTO                                          */
/*==============================================================*/
INSERT INTO TipoEvento
(
    Nombre,
    UsuarioIng
)
VALUES
('Alerta generada',1),
('Alerta atendida',1),
('Alerta cerrada',1),
('Lectura registrada',1),
('Sensor activado',1),
('Sensor desactivado',1),
('Regla modificada',1),
('Usuario inició sesión',1),
('Usuario cerró sesión',1);
GO

/*==============================================================*/
/* TABLA: USUARIO                                               */
/*==============================================================*/

CREATE TABLE Usuario
(
    UsuarioId INT IDENTITY(1,1) PRIMARY KEY,

    NombreCompleto NVARCHAR(200) NOT NULL,

    NombreUsuario NVARCHAR(50) NOT NULL,

    PasswordHash NVARCHAR(255) NOT NULL,

    UltimoAcceso DATETIME2 NULL,

    Activo BIT NOT NULL
        CONSTRAINT DF_Usuario_Activo
        DEFAULT (1),

    RolId INT NOT NULL,

    UsuarioIng INT NOT NULL,

    FechaIng DATETIME2 NOT NULL
        CONSTRAINT DF_Usuario_FechaIng
        DEFAULT(GETDATE()),

    UsuarioAct INT NULL,

    FechaAct DATETIME2 NULL,

    CONSTRAINT FK_Usuario_Rol
        FOREIGN KEY (RolId)
        REFERENCES Rol(RolId),

    CONSTRAINT UQ_Usuario_NombreUsuario
        UNIQUE (NombreUsuario),

    CONSTRAINT CK_Usuario_NombreCompleto
        CHECK (LTRIM(RTRIM(NombreCompleto)) <> ''),

    CONSTRAINT CK_Usuario_NombreUsuario
        CHECK (LTRIM(RTRIM(NombreUsuario)) <> '')
);
GO

/*==============================================================*/
/* USUARIO ADMIN                                                */
/*==============================================================*/

INSERT INTO Usuario
(
    NombreCompleto,
    NombreUsuario,
    PasswordHash,
    RolId,
    UsuarioIng
)
VALUES
(
    'Administrador del Sistema',
    'admin',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    1,
    1
);
GO

/*==============================================================*/
/* TABLA: COMUNIDAD                                             */
/*==============================================================*/

CREATE TABLE Comunidad
(
    ComunidadId INT IDENTITY(1,1) PRIMARY KEY,

    NombreComunidad NVARCHAR(150) NOT NULL,

    Descripcion NVARCHAR(500) NULL,

    Pais NVARCHAR(100) NOT NULL,

    Departamento NVARCHAR(100) NOT NULL,

    Municipio NVARCHAR(100) NOT NULL,

    Latitud DECIMAL(9,6) NOT NULL,

    Longitud DECIMAL(9,6) NOT NULL,

    Activo BIT NOT NULL
        CONSTRAINT DF_Comunidad_Activo
        DEFAULT (1),

    UsuarioIng INT NOT NULL,

    FechaIng DATETIME2 NOT NULL
        CONSTRAINT DF_Comunidad_FechaIng
        DEFAULT (GETDATE()),

    UsuarioAct INT NULL,

    FechaAct DATETIME2 NULL,

    CONSTRAINT FK_Comunidad_UsuarioIng
        FOREIGN KEY (UsuarioIng)
        REFERENCES Usuario(UsuarioId),

    CONSTRAINT FK_Comunidad_UsuarioAct
        FOREIGN KEY (UsuarioAct)
        REFERENCES Usuario(UsuarioId)
);
GO

/*==============================================================*/
/* TABLA: SENSOR                                                */
/*==============================================================*/

CREATE TABLE Sensor
(
    SensorId INT IDENTITY(1,1) PRIMARY KEY,

    Nombre NVARCHAR(100) NOT NULL,

    Codigo NVARCHAR(50) NOT NULL,

    Ubicacion NVARCHAR(200) NOT NULL,

    Descripcion NVARCHAR(500) NULL,

    FechaInstalacion DATETIME2 NOT NULL,

    FechaUltimaConexion DATETIME2 NULL,

    ValorActual DECIMAL(10,2) NULL,

    ComunidadId INT NOT NULL,

    TipoSensorId INT NOT NULL,

    EstadoSensorId INT NOT NULL,

    UsuarioIng INT NOT NULL,

    FechaIng DATETIME2 NOT NULL
        CONSTRAINT DF_Sensor_FechaIng
        DEFAULT(GETDATE()),

    UsuarioAct INT NULL,

    FechaAct DATETIME2 NULL,

    CONSTRAINT FK_Sensor_Comunidad
        FOREIGN KEY (ComunidadId)
        REFERENCES Comunidad(ComunidadId),

    CONSTRAINT FK_Sensor_TipoSensor
        FOREIGN KEY (TipoSensorId)
        REFERENCES TipoSensor(TipoSensorId),

    CONSTRAINT FK_Sensor_EstadoSensor
        FOREIGN KEY (EstadoSensorId)
        REFERENCES EstadoSensor(EstadoSensorId),

    CONSTRAINT FK_Sensor_UsuarioIng
        FOREIGN KEY (UsuarioIng)
        REFERENCES Usuario(UsuarioId),

    CONSTRAINT FK_Sensor_UsuarioAct
        FOREIGN KEY (UsuarioAct)
        REFERENCES Usuario(UsuarioId),

    CONSTRAINT UQ_Sensor_Codigo
        UNIQUE (Codigo)
);
GO

/*==============================================================*/
/* TABLA: LECTURA                                               */
/*==============================================================*/

CREATE TABLE Lectura
(
    LecturaId BIGINT IDENTITY(1,1) PRIMARY KEY,

    Valor DECIMAL(10,2) NOT NULL,

    FechaHora DATETIME2 NOT NULL
        CONSTRAINT DF_Lectura_FechaHora
        DEFAULT(GETDATE()),

    SensorId INT NOT NULL,

    UsuarioIng INT NOT NULL,

    FechaIng DATETIME2 NOT NULL
        CONSTRAINT DF_Lectura_FechaIng
        DEFAULT(GETDATE()),

    CONSTRAINT FK_Lectura_Sensor
        FOREIGN KEY (SensorId)
        REFERENCES Sensor(SensorId),

    CONSTRAINT FK_Lectura_UsuarioIng
        FOREIGN KEY (UsuarioIng)
        REFERENCES Usuario(UsuarioId)
);
GO

/*==============================================================*/
/* TABLA: REGLA ALERTA                                          */  
/* sustituye a umbral del proyecto1                             */
/*==============================================================*/

CREATE TABLE ReglaAlerta
(
    ReglaAlertaId INT IDENTITY(1,1) PRIMARY KEY,

    Nombre NVARCHAR(100) NOT NULL,

    ValorMin DECIMAL(10,2) NOT NULL,

    ValorMax DECIMAL(10,2) NOT NULL,

    Mensaje NVARCHAR(500) NOT NULL,

    Activo BIT NOT NULL
        CONSTRAINT DF_ReglaAlerta_Activo
        DEFAULT(1),

    TipoSensorId INT NOT NULL,

    TipoFenomenoId INT NOT NULL,

    NivelAlertaId INT NOT NULL,

    UsuarioIng INT NOT NULL,

    FechaIng DATETIME2 NOT NULL
        CONSTRAINT DF_ReglaAlerta_FechaIng
        DEFAULT(GETDATE()),

    UsuarioAct INT NULL,

    FechaAct DATETIME2 NULL,

    CONSTRAINT FK_ReglaAlerta_TipoSensor
        FOREIGN KEY (TipoSensorId)
        REFERENCES TipoSensor(TipoSensorId),

    CONSTRAINT FK_ReglaAlerta_TipoFenomeno
        FOREIGN KEY (TipoFenomenoId)
        REFERENCES TipoFenomeno(TipoFenomenoId),

    CONSTRAINT FK_ReglaAlerta_NivelAlerta
        FOREIGN KEY (NivelAlertaId)
        REFERENCES NivelAlerta(NivelAlertaId),

    CONSTRAINT FK_ReglaAlerta_UsuarioIng
        FOREIGN KEY (UsuarioIng)
        REFERENCES Usuario(UsuarioId),

    CONSTRAINT FK_ReglaAlerta_UsuarioAct
        FOREIGN KEY (UsuarioAct)
        REFERENCES Usuario(UsuarioId),

    CONSTRAINT CK_ReglaAlerta_Rango
        CHECK (ValorMin < ValorMax)
);
GO

/*==============================================================*/
/* TABLA: ALERTA                                                */
/*==============================================================*/

CREATE TABLE Alerta
(
    AlertaId BIGINT IDENTITY(1,1) PRIMARY KEY,

    ValorDetectado DECIMAL(10,2) NOT NULL,

    MensajeSnap NVARCHAR(500) NOT NULL,

    NivelAlertaIdSnap INT NOT NULL,

    TipoFenomenoIdSnap INT NOT NULL,

    FechaHora DATETIME2 NOT NULL
        CONSTRAINT DF_Alerta_FechaHora
        DEFAULT(GETDATE()),

    Activo BIT NOT NULL
        CONSTRAINT DF_Alerta_Activo
        DEFAULT(1),

    SensorId INT NOT NULL,

    ComunidadId INT NOT NULL,

    ReglaAlertaId INT NOT NULL,

    EstadoAlertaId INT NOT NULL,

    UsuarioResponsableId INT NULL,

    UsuarioIng INT NOT NULL,

    FechaIng DATETIME2 NOT NULL
        CONSTRAINT DF_Alerta_FechaIng
        DEFAULT(GETDATE()),

    UsuarioAct INT NULL,

    FechaAct DATETIME2 NULL,

    CONSTRAINT FK_Alerta_Sensor
        FOREIGN KEY (SensorId)
        REFERENCES Sensor(SensorId),

    CONSTRAINT FK_Alerta_Comunidad
        FOREIGN KEY (ComunidadId)
        REFERENCES Comunidad(ComunidadId),

    CONSTRAINT FK_Alerta_Regla
        FOREIGN KEY (ReglaAlertaId)
        REFERENCES ReglaAlerta(ReglaAlertaId),

    CONSTRAINT FK_Alerta_Estado
        FOREIGN KEY (EstadoAlertaId)
        REFERENCES EstadoAlerta(EstadoAlertaId),

    CONSTRAINT FK_Alerta_Responsable
        FOREIGN KEY (UsuarioResponsableId)
        REFERENCES Usuario(UsuarioId),

    CONSTRAINT FK_Alerta_UsuarioIng
        FOREIGN KEY (UsuarioIng)
        REFERENCES Usuario(UsuarioId),

    CONSTRAINT FK_Alerta_UsuarioAct
        FOREIGN KEY (UsuarioAct)
        REFERENCES Usuario(UsuarioId)
);
GO

/*==============================================================*/
/* TABLA: EVENTO                                                */
/*==============================================================*/

CREATE TABLE Evento
(
    EventoId BIGINT IDENTITY(1,1) PRIMARY KEY,

    Descripcion NVARCHAR(500) NOT NULL,

    FechaHora DATETIME2 NOT NULL
        CONSTRAINT DF_Evento_FechaHora
        DEFAULT(GETDATE()),

    TipoEventoId INT NOT NULL,

    AlertaId BIGINT NOT NULL,

    UsuarioIng INT NOT NULL,

    FechaIng DATETIME2 NOT NULL
        CONSTRAINT DF_Evento_FechaIng
        DEFAULT(GETDATE()),

    UsuarioAct INT NULL,

    FechaAct DATETIME2 NULL,

    CONSTRAINT FK_Evento_TipoEvento
        FOREIGN KEY (TipoEventoId)
        REFERENCES TipoEvento(TipoEventoId),

    CONSTRAINT FK_Evento_Alerta
        FOREIGN KEY (AlertaId)
        REFERENCES Alerta(AlertaId),

    CONSTRAINT FK_Evento_UsuarioIng
        FOREIGN KEY (UsuarioIng)
        REFERENCES Usuario(UsuarioId),

    CONSTRAINT FK_Evento_UsuarioAct
        FOREIGN KEY (UsuarioAct)
        REFERENCES Usuario(UsuarioId)
);
GO

/*==============================================================*/
/* TABLA: BITACORA                                              */
/*==============================================================*/

CREATE TABLE Bitacora
(
    BitacoraId BIGINT IDENTITY(1,1) PRIMARY KEY,

    NombreEntidad NVARCHAR(100) NOT NULL,

    EntidadId BIGINT NOT NULL,

    Accion NVARCHAR(50) NOT NULL,

    Descripcion NVARCHAR(500) NOT NULL,

    FechaHora DATETIME2 NOT NULL
        CONSTRAINT DF_Bitacora_FechaHora
        DEFAULT(GETDATE()),

    UsuarioId INT NOT NULL,

    CONSTRAINT FK_Bitacora_Usuario
        FOREIGN KEY (UsuarioId)
        REFERENCES Usuario(UsuarioId)
);
GO

/*==============================================================*/
/* TABLA: NOTIFICACION                                          */
/*==============================================================*/

CREATE TABLE Notificacion
(
    NotificacionId BIGINT IDENTITY(1,1) PRIMARY KEY,

    AlertaId BIGINT NOT NULL,

    UsuarioId INT NOT NULL,

    FechaEnvio DATETIME2 NOT NULL
        CONSTRAINT DF_Notificacion_FechaEnvio
        DEFAULT(GETDATE()),

    Leida BIT NOT NULL
        CONSTRAINT DF_Notificacion_Leida
        DEFAULT(0),

    CONSTRAINT FK_Notificacion_Alerta
        FOREIGN KEY (AlertaId)
        REFERENCES Alerta(AlertaId),

    CONSTRAINT FK_Notificacion_Usuario
        FOREIGN KEY (UsuarioId)
        REFERENCES Usuario(UsuarioId)
);
GO

/*==============================================================*/
/* INDICES POR EL DASHBOARD                                     */
/*==============================================================*/

CREATE INDEX IX_Sensor_Comunidad
ON Sensor(ComunidadId);

CREATE INDEX IX_Sensor_TipoSensor
ON Sensor(TipoSensorId);

CREATE INDEX IX_Lectura_Sensor_Fecha
ON Lectura(SensorId, FechaHora DESC);

CREATE INDEX IX_Alerta_Fecha
ON Alerta(FechaHora DESC);

CREATE INDEX IX_Alerta_Estado
ON Alerta(EstadoAlertaId);

CREATE INDEX IX_Evento_Fecha
ON Evento(FechaHora DESC);

CREATE INDEX IX_Bitacora_Fecha
ON Bitacora(FechaHora DESC);

CREATE INDEX IX_Notificacion_Usuario
ON Notificacion(UsuarioId);

CREATE INDEX IX_Alerta_Comunidad
ON Alerta(ComunidadId);

CREATE INDEX IX_Evento_Alerta
ON Evento(AlertaId);

CREATE INDEX IX_Regla_TipoSensor
ON ReglaAlerta(TipoSensorId);