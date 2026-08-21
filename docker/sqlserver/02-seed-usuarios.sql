-- =====================================================================
--  Datos semilla: usuarios para poder iniciar sesión
-- =====================================================================
--  El script principal del equipo (QueryMain.sql) crea las tablas pero
--  NO inserta usuarios. Sin usuarios no se puede entrar al sistema.
--
--  Este archivo agrega dos usuarios de prueba. Las contraseñas están
--  hasheadas con SHA256 en hexadecimal, que es EXACTAMENTE el algoritmo
--  que usa el backend (EncryptPassword.encryptSHA256). Así el login
--  las reconoce.
--
--  Contraseñas en claro (solo para desarrollo):
--     JDoe   -> Compu23
--     admin  -> Admin123
-- =====================================================================

USE MonitoreoClimatico;
GO

-- Solo insertar si no existen ya (para que el script se pueda correr
-- más de una vez sin duplicar).
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE NombreUsuario = 'JDoe')
BEGIN
    INSERT INTO Usuario (Nombre1, Nombre2, Apellido1, Apellido2, NombreUsuario, PasswordHash, Rol, Activo)
    VALUES ('John', 'Michael', 'Doe', 'Smith', 'JDoe',
            '34a0d703ced482fcdcbdd2ece107ff84b00edd5d4065ac56529a233865099dd0', -- SHA256('Compu23')
            'Operador', 1);
END
GO

IF NOT EXISTS (SELECT 1 FROM Usuario WHERE NombreUsuario = 'admin')
BEGIN
    INSERT INTO Usuario (Nombre1, Nombre2, Apellido1, Apellido2, NombreUsuario, PasswordHash, Rol, Activo)
    VALUES ('Administrador', 'del', 'Sistema', 'ClimGuard', 'admin',
            '3b612c75a7b5048a435fb6ec81e52ff92d6d795a8b5a9c17070f6a63c97a53b2', -- SHA256('Admin123')
            'Administrador', 1);
END
GO
