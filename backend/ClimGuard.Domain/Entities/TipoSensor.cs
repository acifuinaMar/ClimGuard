namespace ClimGuard.Domain.Entities;

/// <summary>
/// Catalogo de variables climaticas. Son las cinco del enunciado:
/// temperatura, humedad relativa, velocidad del viento, nivel de lluvia
/// y nivel de rio o reservorio.
///
/// Agregar una variable nueva (calidad del aire, presion atmosferica)
/// es insertar una fila. Cero codigo. Eso es RNF-005.
/// </summary>
public class TipoSensor
{
    public int IdTipoSensor { get; set; }
    public string Nombre { get; set; } = string.Empty;

    /// <summary>Unidad en que se expresa: grados C, %, km/h, mm, m.</summary>
    public string UnidadMedida { get; set; } = string.Empty;

    /// <summary>Rangos plausibles, para que el simulador genere valores realistas.</summary>
    public decimal ValorMinimoTipico { get; set; }
    public decimal ValorMaximoTipico { get; set; }
}
