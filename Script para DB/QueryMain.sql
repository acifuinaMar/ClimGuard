-- =========================================================
-- SISTEMA DE MONITOREO Y ALERTA TEMPRANA - RIESGOS CLIMÁTICOS
-- Script de creación de base de datos - SQL Server
-- =========================================================

CREATE DATABASE MonitoreoClimatico;
GO
USE MonitoreoClimatico;
GO

-- =========================================================
-- 1. COMUNIDADES
-- Comunidades rurales monitoreadas
-- =========================================================
CREATE TABLE Comunidad (
    ComunidadId     INT IDENTITY(1,1) PRIMARY KEY,
    Nombre          NVARCHAR(100) NOT NULL,
    Latitud         DECIMAL(9,6) NULL,
    Longitud        DECIMAL(9,6) NULL,
    Descripcion     NVARCHAR(255) NULL,
    FechaRegistro   DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- =========================================================
-- 2. TIPO DE SENSOR
-- Catálogo: Temperatura, Humedad, Viento, Lluvia, Nivel de río
-- =========================================================
CREATE TABLE TipoSensor (
    TipoSensorId    INT IDENTITY(1,1) PRIMARY KEY,
    Nombre          NVARCHAR(50) NOT NULL UNIQUE,   -- Ej: 'Temperatura'
    UnidadMedida    NVARCHAR(20) NOT NULL           -- Ej: '°C', '%', 'km/h', 'mm', 'm'
);
GO

-- =========================================================
-- 3. SENSOR
-- Sensores simulados asociados a una comunidad
-- =========================================================
CREATE TABLE Sensor (
    SensorId            INT IDENTITY(1,1) PRIMARY KEY,
    ComunidadId         INT NOT NULL,
    TipoSensorId        INT NOT NULL,
    Nombre              NVARCHAR(100) NOT NULL,
    ValorActual         DECIMAL(10,2) NOT NULL DEFAULT 0,
    Activo              BIT NOT NULL DEFAULT 1,
    FechaInstalacion    DATETIME NOT NULL DEFAULT GETDATE(),
    UltimaActualizacion DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Sensor_Comunidad FOREIGN KEY (ComunidadId) REFERENCES Comunidad(ComunidadId),
    CONSTRAINT FK_Sensor_TipoSensor FOREIGN KEY (TipoSensorId) REFERENCES TipoSensor(TipoSensorId)
);
GO

-- =========================================================
-- 4. LECTURA DE SENSOR
-- Histórico de valores para graficar evolución en el dashboard
-- =========================================================
CREATE TABLE LecturaSensor (
    LecturaId       BIGINT IDENTITY(1,1) PRIMARY KEY,
    SensorId        INT NOT NULL,
    Valor           DECIMAL(10,2) NOT NULL,
    FechaHora       DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Lectura_Sensor FOREIGN KEY (SensorId) REFERENCES Sensor(SensorId)
);
GO

-- =========================================================
-- 5. NIVEL DE ALERTA
-- Catálogo: Verde, Amarillo, Naranja, Rojo
-- =========================================================
CREATE TABLE NivelAlerta (
    NivelAlertaId   INT IDENTITY(1,1) PRIMARY KEY,
    Nombre          NVARCHAR(20) NOT NULL UNIQUE,   -- Verde, Amarillo, Naranja, Rojo
    ColorHex        NVARCHAR(7) NOT NULL,           -- Ej: '#28a745'
    Orden           INT NOT NULL                    -- 1=Verde ... 4=Rojo (severidad)
);
GO

-- =========================================================
-- 6. TIPO DE FENÓMENO
-- Catálogo: Inundación, Sequía, Tormenta, Helada, Incendio forestal
-- =========================================================
CREATE TABLE TipoFenomeno (
    TipoFenomenoId  INT IDENTITY(1,1) PRIMARY KEY,
    Nombre          NVARCHAR(50) NOT NULL UNIQUE
);
GO

-- =========================================================
-- 7. ALERTA (también funciona como historial de eventos)
-- Cada registro es una alerta generada automáticamente
-- =========================================================
CREATE TABLE Alerta (
    AlertaId        BIGINT IDENTITY(1,1) PRIMARY KEY,
    ComunidadId     INT NOT NULL,
    SensorId        INT NULL,                       -- sensor que originó la alerta (opcional)
    TipoFenomenoId  INT NOT NULL,
    NivelAlertaId   INT NOT NULL,
    Mensaje         NVARCHAR(300) NOT NULL,
    FechaHora       DATETIME NOT NULL DEFAULT GETDATE(),
    Activa          BIT NOT NULL DEFAULT 1,
    FechaResolucion DATETIME NULL,
    CONSTRAINT FK_Alerta_Comunidad FOREIGN KEY (ComunidadId) REFERENCES Comunidad(ComunidadId),
    CONSTRAINT FK_Alerta_Sensor FOREIGN KEY (SensorId) REFERENCES Sensor(SensorId),
    CONSTRAINT FK_Alerta_TipoFenomeno FOREIGN KEY (TipoFenomenoId) REFERENCES TipoFenomeno(TipoFenomenoId),
    CONSTRAINT FK_Alerta_NivelAlerta FOREIGN KEY (NivelAlertaId) REFERENCES NivelAlerta(NivelAlertaId)
);
GO

-- =========================================================
-- 8. USUARIO (Administración del sistema)
-- =========================================================
CREATE TABLE Usuario (
    UsuarioId       INT IDENTITY(1,1) PRIMARY KEY,
    Nombre1  NVARCHAR(100) NOT NULL,
    Nombre2  NVARCHAR(100) NOT NULL,
    Apellido1  NVARCHAR(100) NOT NULL,
    Apellido2  NVARCHAR(100) NOT NULL,
    NombreUsuario   NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash    NVARCHAR(255) NOT NULL,
    Rol             NVARCHAR(20) NOT NULL DEFAULT 'Administrador',
    Activo          BIT NOT NULL DEFAULT 1,
    FechaRegistro   DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- =========================================================
-- DATOS INICIALES (catálogos)
-- =========================================================
INSERT INTO TipoSensor (Nombre, UnidadMedida) VALUES
('Temperatura', '°C'),
('Humedad', '%'),
('Viento', 'km/h'),
('Lluvia', 'mm'),
('Nivel de Río', 'm');
GO

INSERT INTO NivelAlerta (Nombre, ColorHex, Orden) VALUES
('Verde', '#28a745', 1),
('Amarillo', '#ffc107', 2),
('Naranja', '#fd7e14', 3),
('Rojo', '#dc3545', 4);
GO

INSERT INTO TipoFenomeno (Nombre) VALUES
('Inundación'),
('Sequía'),
('Tormenta'),
('Helada'),
('Incendio Forestal');
GO

-- =========================================================
-- 8. Rol
-- =========================================================
CREATE TABLE Rol (
    RolId       INT IDENTITY(1,1) PRIMARY KEY,
    Rol  NVARCHAR(50) NOT NULL,
    Descripcion   NVARCHAR(100) NOT NULL,
);
go
INSERT INTO Rol (Rol,Descripcion) VALUES
('Administrador','Administrador'),
('Consultor','Consultor')
GO

-- =========================================================
-- 8. Estado Alerta
-- =========================================================
CREATE TABLE EstadoAlerta (
    EstadoAlertaId       INT IDENTITY(1,1) PRIMARY KEY,
    Estado  NVARCHAR(50) NOT NULL
);
go
INSERT INTO EstadoAlerta (Estado) VALUES
('Activa'),
('Atendidad'),
('Cerrada')
GO

-- =========================================================
-- 8. Estado Sensor
-- =========================================================
CREATE TABLE EstadoSensor (
    EstadoSensorId       INT IDENTITY(1,1) PRIMARY KEY,
    Estado  NVARCHAR(50) NOT NULL
);
go
INSERT INTO EstadoSensor (Estado) VALUES
('Activa'),
('Inactivo'),
('Mantenimiento'),
('Fuera de linea')
GO

-- =========================================================
-- 8. Bitacora
-- =========================================================
CREATE TABLE Bitacora (
    BitacoraId       INT IDENTITY(1,1) PRIMARY KEY,
    UsuarioId int references Usuario(UsuarioId), 
    Accion  NVARCHAR(500) NOT NULL,
    FechaRegistro DATETIME NOT NULL DEFAULT GETDATE(),
);
-- =========================================================
-- 8. Umbral
-- =========================================================
CREATE TABLE Umbral (
    UmbralId       INT IDENTITY(1,1) PRIMARY KEY,
    ValorAdvertencia  DECIMAL(10,2),
    ValorCritico    decimal(10,2),
);
-- =========================================================
-- 8. Notificacion
-- =========================================================
CREATE TABLE Notificacion (
    NotificacionId       INT IDENTITY(1,1) PRIMARY KEY,
    FechaEnvio DATETIME NOT NULL DEFAULT GETDATE(),
    Leido bit default 0,
);