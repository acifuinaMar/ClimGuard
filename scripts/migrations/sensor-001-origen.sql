-- =====================================================================================================
-- sensor-001-origen.sql  ·  SQL Server (base del Sensor Service)  ·  ADITIVA e IDEMPOTENTE
-- Agrega Sensor.Origen ('FISICO' | 'SIMULADO'). No borra ni modifica filas existentes.
--
-- La aplicación ya lo hace sola al arrancar (SchemaUpgrades.cs, Migrations__AutoApply=true). Use este script si
-- prefiere aplicarlo a mano ANTES de desplegar (con Migrations__AutoApply=false). NO se ejecutó contra ninguna base real.
-- Antes: respaldo (ver DESPLIEGUE-SEGURO.md).  Ejecutar con sqlcmd dentro del contenedor o con SSMS.
-- =====================================================================================================

-- 1) Columna (los sensores EXISTENTES quedan como FISICO: el simulador deja de generarles lecturas)
IF COL_LENGTH('dbo.Sensor', 'Origen') IS NULL
BEGIN
    ALTER TABLE dbo.Sensor ADD Origen NVARCHAR(10) NOT NULL CONSTRAINT DF_Sensor_Origen DEFAULT 'FISICO';
END
GO

-- 2) Restricción de valores permitidos
IF COL_LENGTH('dbo.Sensor', 'Origen') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_Sensor_Origen')
BEGIN
    EXEC('ALTER TABLE dbo.Sensor ADD CONSTRAINT CK_Sensor_Origen CHECK (Origen IN (''FISICO'',''SIMULADO''))');
END
GO

-- 3) REVISIÓN (solo lectura): ¿qué sensores recibían lecturas automáticas? Los que sigan llegando a ritmo
--    del simulador (cada ~5 s) y NO sean dispositivos reales deberían pasar a SIMULADO.
SELECT s.SensorId, s.Codigo, s.Nombre, s.EstadoSensorId, s.Origen,
       COUNT(l.LecturaId) AS LecturasUltimaHora, MAX(l.FechaHora) AS UltimaLectura
FROM dbo.Sensor s
LEFT JOIN dbo.LecturaSensor l ON l.SensorId = s.SensorId AND l.FechaHora >= DATEADD(HOUR, -1, SYSUTCDATETIME())
GROUP BY s.SensorId, s.Codigo, s.Nombre, s.EstadoSensorId, s.Origen
ORDER BY s.SensorId;
GO

-- 4) DECISIÓN MANUAL (comentado a propósito): marcar como SIMULADO los sensores de demostración.
--    Sustituya la lista por los códigos que usted sabe que NO son dispositivos reales.
-- UPDATE dbo.Sensor SET Origen = 'SIMULADO', FechaAct = SYSUTCDATETIME() WHERE Codigo IN ('TMP-001', 'LLV-001', 'NVL-001');

-- =====================================================================================================
-- ROLLBACK (opcional; la versión anterior de la aplicación ignora la columna, por lo que NO es necesario para volver atrás)
-- =====================================================================================================
-- ALTER TABLE dbo.Sensor DROP CONSTRAINT CK_Sensor_Origen;
-- ALTER TABLE dbo.Sensor DROP CONSTRAINT DF_Sensor_Origen;
-- ALTER TABLE dbo.Sensor DROP COLUMN Origen;
