using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace ClimGuard.Community;

public class Community
{
    public int ComunidadId { get; set; }
    public string NombreComunidad { get; set; } = "";
    public string? Descripcion { get; set; }
    public string Pais { get; set; } = "";
    public string Departamento { get; set; } = "";
    public string Municipio { get; set; } = "";
    public decimal Latitud { get; set; }
    public decimal Longitud { get; set; }
    public bool Activo { get; set; } = true;
    public int UsuarioIng { get; set; }
    public DateTime FechaIng { get; set; } = DateTime.UtcNow;
    public int? UsuarioAct { get; set; }
    public DateTime? FechaAct { get; set; }
}

public class CommunityDb(DbContextOptions<CommunityDb> o) : DbContext(o)
{
    public DbSet<Community> Communities => Set<Community>();
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Community>(e =>
        {
            e.ToTable("communities");
            e.HasKey(x => x.ComunidadId);
            e.Property(x => x.NombreComunidad).HasMaxLength(150).IsRequired();
            e.Property(x => x.Descripcion).HasMaxLength(500);
            e.Property(x => x.Pais).HasMaxLength(80); e.Property(x => x.Departamento).HasMaxLength(80); e.Property(x => x.Municipio).HasMaxLength(80);
            e.Property(x => x.Latitud).HasPrecision(9, 6); e.Property(x => x.Longitud).HasPrecision(9, 6);
            e.HasIndex(x => x.NombreComunidad).IsUnique();
        });
    }
}

public record CommunityDto(int ComunidadId, string NombreComunidad, string? Descripcion, string Pais, string Departamento, string Municipio,
    decimal Latitud, decimal Longitud, bool Activo, int UsuarioIng, DateTime FechaIng, int? UsuarioAct, DateTime? FechaAct)
{
    public static CommunityDto From(Community c) => new(c.ComunidadId, c.NombreComunidad, c.Descripcion, c.Pais, c.Departamento, c.Municipio,
        c.Latitud, c.Longitud, c.Activo, c.UsuarioIng, DateTime.SpecifyKind(c.FechaIng, DateTimeKind.Utc), c.UsuarioAct,
        c.FechaAct is { } f ? DateTime.SpecifyKind(f, DateTimeKind.Utc) : null);
}

public record CommunityInput(string? NombreComunidad, string? Descripcion, string? Pais, string? Departamento, string? Municipio,
    decimal Latitud, decimal Longitud, bool? Activo)
{
    public string? Validate()
    {
        if (string.IsNullOrWhiteSpace(NombreComunidad) || NombreComunidad.Length > 150) return "Nombre obligatorio (máx. 150)";
        if (string.IsNullOrWhiteSpace(Pais) || string.IsNullOrWhiteSpace(Departamento) || string.IsNullOrWhiteSpace(Municipio)) return "País, departamento y municipio son obligatorios";
        if (Latitud is < -90 or > 90) return "Latitud fuera de rango";
        if (Longitud is < -180 or > 180) return "Longitud fuera de rango";
        return null;
    }
    public void ApplyTo(Community c)
    {
        c.NombreComunidad = NombreComunidad!.Trim(); c.Descripcion = Descripcion?.Trim();
        c.Pais = Pais!.Trim(); c.Departamento = Departamento!.Trim(); c.Municipio = Municipio!.Trim();
        c.Latitud = Latitud; c.Longitud = Longitud; c.Activo = Activo ?? true;
    }
}

public static class Ext
{
    public static int UserId(this ClaimsPrincipal u) => int.TryParse(u.FindFirstValue("sub"), out var id) ? id : 0;
}

public class AuditEmitter(IHttpClientFactory f, IConfiguration cfg, ILogger<AuditEmitter> log)
{
    public void Emit(ClaimsPrincipal u, string action, string resource, object detail)
    {
        _ = Task.Run(async () =>
        {
            try
            {
                using var req = new HttpRequestMessage(HttpMethod.Post, "api/audit") { Content = JsonContent.Create(new { action, resource, detail, userId = u.FindFirstValue("sub") ?? "0", user = u.FindFirstValue("preferred_username") ?? "" }) };
                req.Headers.Add("X-Internal-Key", cfg["InternalApiKey"] ?? "");
                (await f.CreateClient("audit").SendAsync(req)).Dispose();
            }
            catch (Exception ex) { log.LogWarning("No se pudo auditar {A}: {E}", action, ex.GetType().Name); }
        });
    }
}
