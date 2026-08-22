namespace ClimGuard.Domain.Entities;

/// <summary>Catalogo de roles. RN-001: cada usuario tiene un unico rol.</summary>
public class Rol
{
    public int IdRol { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}
