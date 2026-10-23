using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace ClimGuard.Sensor;

public class SensorType { public int TipoSensorId { get; set; } public string Nombre { get; set; } = ""; public string UnidadMedida { get; set; } = ""; public bool Activo { get; set; } = true; }
public class SensorState { public int EstadoSensorId { get; set; } public string Nombre { get; set; } = ""; public bool Activo { get; set; } = true; }

public class Sensor
{
    public int SensorId { get; set; }
    public string Nombre { get; set; } = "";
    public string Codigo { get; set; } = "";
    public string Ubicacion { get; set; } = "";
    public string Descripcion { get; set; } = "";
    public DateTime FechaInstalacion { get; set; }
    public DateTime FechaUltimaConexion { get; set; }
    public decimal ValorActual { get; set; }
    public int ComunidadId { get; set; }   // referencia lógica: la comunidad vive en Community Service
    public int TipoSensorId { get; set; }
    public int EstadoSensorId { get; set; }
    public int UsuarioIng { get; set; }
    public DateTime FechaIng { get; set; } = DateTime.UtcNow;
    public int? UsuarioAct { get; set; }
    public DateTime? FechaAct { get; set; }
}

public class Reading
{
    public long LecturaId { get; set; }
    public int SensorId { get; set; }
    public decimal Valor { get; set; }
    public DateTime FechaHora { get; set; }
    public int UsuarioIng { get; set; }
}

public class SensorDb(DbContextOptions<SensorDb> o) : DbContext(o)
{
    public DbSet<SensorType> SensorTypes => Set<SensorType>();
    public DbSet<SensorState> SensorStates => Set<SensorState>();
    public DbSet<Sensor> Sensors => Set<Sensor>();
    public DbSet<Reading> Readings => Set<Reading>();

    // Todas las fechas se guardan y se devuelven como UTC.
    protected override void ConfigureConventions(ModelConfigurationBuilder c)
    {
        c.Properties<DateTime>().HaveConversion<UtcConverter>();
        c.Properties<decimal>().HavePrecision(18, 2);
    }

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<SensorType>(e => { e.ToTable("TipoSensor"); e.HasKey(x => x.TipoSensorId); e.Property(x => x.Nombre).HasMaxLength(60); e.Property(x => x.UnidadMedida).HasMaxLength(20); });
        b.Entity<SensorState>(e => { e.ToTable("EstadoSensor"); e.HasKey(x => x.EstadoSensorId); e.Property(x => x.Nombre).HasMaxLength(60); });
        b.Entity<Sensor>(e =>
        {
            e.ToTable("Sensor"); e.HasKey(x => x.SensorId);
            e.Property(x => x.Nombre).HasMaxLength(120); e.Property(x => x.Codigo).HasMaxLength(40);
            e.Property(x => x.Ubicacion).HasMaxLength(200); e.Property(x => x.Descripcion).HasMaxLength(500);
            e.HasIndex(x => x.Codigo).IsUnique(); e.HasIndex(x => x.ComunidadId);
            e.HasOne<SensorType>().WithMany().HasForeignKey(x => x.TipoSensorId);
            e.HasOne<SensorState>().WithMany().HasForeignKey(x => x.EstadoSensorId);
        });
        b.Entity<Reading>(e =>
        {
            e.ToTable("LecturaSensor"); e.HasKey(x => x.LecturaId);
            e.HasIndex(x => new { x.SensorId, x.FechaHora }); e.HasIndex(x => x.FechaHora);
            e.HasOne<Sensor>().WithMany().HasForeignKey(x => x.SensorId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}

public class UtcConverter() : Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateTime, DateTime>(
    v => v.Kind == DateTimeKind.Utc ? v : v.ToUniversalTime(), v => DateTime.SpecifyKind(v, DateTimeKind.Utc));

public record SensorDto(int SensorId, string Nombre, string Codigo, string Ubicacion, string Descripcion, DateTime FechaInstalacion,
    DateTime FechaUltimaConexion, decimal ValorActual, int ComunidadId, int TipoSensorId, int EstadoSensorId, int UsuarioIng, DateTime FechaIng, int? UsuarioAct, DateTime? FechaAct)
{
    public static SensorDto From(Sensor s) => new(s.SensorId, s.Nombre, s.Codigo, s.Ubicacion, s.Descripcion, s.FechaInstalacion, s.FechaUltimaConexion,
        s.ValorActual, s.ComunidadId, s.TipoSensorId, s.EstadoSensorId, s.UsuarioIng, s.FechaIng, s.UsuarioAct, s.FechaAct is { } fa ? DateTime.SpecifyKind(fa, DateTimeKind.Utc) : null);
}

public record SensorInput(string? Nombre, string? Codigo, string? Ubicacion, string? Descripcion, DateTime? FechaInstalacion,
    int ComunidadId, int TipoSensorId, int EstadoSensorId)
{
    public string? Validate()
    {
        if (string.IsNullOrWhiteSpace(Nombre) || Nombre.Length > 120) return "Nombre obligatorio (máx. 120)";
        if (string.IsNullOrWhiteSpace(Codigo) || Codigo.Length > 40) return "Código obligatorio (máx. 40)";
        if (string.IsNullOrWhiteSpace(Ubicacion)) return "Ubicación obligatoria";
        if (ComunidadId <= 0 || TipoSensorId <= 0 || EstadoSensorId <= 0) return "Comunidad, tipo y estado son obligatorios";
        return null;
    }
}

public record ReadingDto(long LecturaId, int SensorId, decimal Valor, DateTime FechaHora)
{
    public static ReadingDto From(Reading r) => new(r.LecturaId, r.SensorId, r.Valor, r.FechaHora);
}
public record ReadingInput(int SensorId, decimal Valor, DateTime? FechaHora);
public record StatRow(int TipoSensorId, int Cantidad, decimal Promedio, decimal Minimo, decimal Maximo, decimal Suma);

public static class Ext
{
    public static int UserId(this ClaimsPrincipal u) => int.TryParse(u.FindFirstValue("sub"), out var id) ? id : 0;
}
