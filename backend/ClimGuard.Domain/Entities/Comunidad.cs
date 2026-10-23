namespace ClimGuard.Domain.Entities;

/// <summary>
/// Comunidad monitoreada. Es lo que sostiene RNF-005 (escalabilidad):
/// agregar una comunidad nueva es insertar una fila, no tocar codigo.
/// </summary>
public class Comunidad
{
    public int IdComunidad { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}
