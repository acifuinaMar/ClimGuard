using ClimGuard.Domain.Enums;

namespace ClimGuard.Domain.Entities;

/// <summary>Riesgo detectado. RN-010: siempre nace de una lectura.</summary>
public class Alerta
{
    public int IdAlerta { get; set; }
    public int IdSensor { get; set; }
    public int IdLectura { get; set; }

    /// <summary>Uno de los cuatro niveles del enunciado.</summary>
    public NivelRiesgo Nivel { get; set; }

    /// <summary>Que fenomeno es. Lo hereda del umbral que se disparo.</summary>
    public TipoFenomeno TipoFenomeno { get; set; }

    public EstadoAlerta Estado { get; set; } = EstadoAlerta.Activa;

    /// <summary>Mensaje legible. El enunciado lo pide explicitamente.</summary>
    public string Descripcion { get; set; } = string.Empty;

    public DateTime FechaHora { get; set; }
    public DateTime? FechaCierre { get; set; }

    public Sensor? Sensor { get; set; }
    public Lectura? Lectura { get; set; }

    public void Cerrar()
    {
        Estado = EstadoAlerta.Cerrada;
        FechaCierre = DateTime.UtcNow;
    }
}
