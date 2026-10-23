namespace ClimGuard.Domain.Entities;

/// <summary>Historial. RN-013: toda alerta se registra automaticamente aqui.</summary>
public class Evento
{
    public int IdEvento { get; set; }
    public int IdAlerta { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime FechaHora { get; set; }

    public Alerta? Alerta { get; set; }
}
