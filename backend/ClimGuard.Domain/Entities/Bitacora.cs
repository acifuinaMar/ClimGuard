namespace ClimGuard.Domain.Entities;

/// <summary>
/// Registro de acciones. RN-018 y exigida por el enunciado.
/// RN-019: solo el Administrador puede consultarla.
/// </summary>
public class Bitacora
{
    public int IdBitacora { get; set; }
    public int IdUsuario { get; set; }
    public string Accion { get; set; } = string.Empty;
    public string? Detalle { get; set; }
    public DateTime FechaHora { get; set; }

    public Usuario? Usuario { get; set; }
}
