using Microsoft.EntityFrameworkCore;

namespace ClimGuard.Sensor;

/// <summary>
/// Cambios de esquema ADITIVOS e idempotentes para bases creadas con EnsureCreated (no hay historial de migraciones EF).
/// Solo agrega columnas/restricciones; nunca borra ni reescribe datos. Se puede desactivar con Migrations:AutoApply=false
/// y aplicar a mano el script equivalente (docs: MIGRACIONES.md, scripts/migrations/sensor-001-origen.sql).
/// </summary>
public static class SchemaUpgrades
{
    // Sensores EXISTENTES quedan como FISICO: así el simulador deja de inventar lecturas para dispositivos reales.
    // Para marcar sensores de demostración como SIMULADO use la UI (editar sensor) o el script SQL documentado.
    internal const string AddOrigen = """
        IF COL_LENGTH('dbo.Sensor', 'Origen') IS NULL
        BEGIN
            ALTER TABLE dbo.Sensor ADD Origen NVARCHAR(10) NOT NULL CONSTRAINT DF_Sensor_Origen DEFAULT 'FISICO';
        END
        """;

    internal const string AddOrigenCheck = """
        IF COL_LENGTH('dbo.Sensor', 'Origen') IS NOT NULL
           AND NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_Sensor_Origen')
        BEGIN
            EXEC('ALTER TABLE dbo.Sensor ADD CONSTRAINT CK_Sensor_Origen CHECK (Origen IN (''FISICO'',''SIMULADO''))');
        END
        """;

    public static async Task ApplyAsync(SensorDb db, ILogger log)
    {
        var antes = await ColumnaExisteAsync(db);
        await db.Database.ExecuteSqlRawAsync(AddOrigen);
        await db.Database.ExecuteSqlRawAsync(AddOrigenCheck);
        if (!antes) log.LogWarning("Esquema actualizado: columna Sensor.Origen agregada. Los sensores existentes quedaron como FISICO; revise cuáles son SIMULADO.");
    }

    private static async Task<bool> ColumnaExisteAsync(SensorDb db)
    {
        var conn = db.Database.GetDbConnection();
        var abrir = conn.State != System.Data.ConnectionState.Open;
        if (abrir) await conn.OpenAsync();
        try
        {
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT CASE WHEN COL_LENGTH('dbo.Sensor', 'Origen') IS NULL THEN 0 ELSE 1 END";
            return Convert.ToInt32(await cmd.ExecuteScalarAsync()) == 1;
        }
        finally { if (abrir) await conn.CloseAsync(); }
    }
}
