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

-- Esquema Fase 2: NombreCompleto / RolId (1 Administrador, 2 Operador, 3 Consulta).
-- El usuario 'admin' ya lo inserta QueryMain_P2.sql, por eso aquí solo se agrega JDoe.
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE NombreUsuario = 'JDoe')
BEGIN
    INSERT INTO Usuario (NombreCompleto, NombreUsuario, PasswordHash, RolId, UsuarioIng)
    VALUES ('John Michael Doe Smith', 'JDoe',
            '34a0d703ced482fcdcbdd2ece107ff84b00edd5d4065ac56529a233865099dd0', -- SHA256('Compu23')
            2, 1);
END
GO
