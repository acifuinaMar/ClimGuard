using ClimGuard.Domain.Enums;

namespace ClimGuard.Domain.Entities;

/// <summary>
/// Sensor de monitoreo.
///
/// Nota sobre IdComunidad: admite NULO, a proposito.
/// RN-005 decia "todo sensor debera estar asociado a una unica comunidad",
/// pero DOC-10 lo declaraba nulo, sus restricciones decian que podia
/// registrarse sin asignar, y DOC-09 lo modelaba como 0..1.
/// Tres documentos contra uno: se respeta la mayoria y RN-005 debe corregirse.
/// </summary>
public class Sensor
{
    public int IdSensor { get; set; }
    public int? IdComunidad { get; set; }
    public int IdTipoSensor { get; set; }

    /// <summary>Identificador legible y unico. RN-006.</summary>
    public string Codigo { get; set; } = string.Empty;

    public string Ubicacion { get; set; } = string.Empty;
    public decimal Latitud { get; set; }
    public decimal Longitud { get; set; }
    public EstadoSensor Estado { get; set; } = EstadoSensor.Activo;
    public DateTime FechaInstalacion { get; set; }

    public Comunidad? Comunidad { get; set; }
    public TipoSensor? TipoSensor { get; set; }

    /// <summary>Las reglas de vigilancia. Varias, una por direccion.</summary>
    public List<Umbral> Umbrales { get; set; } = new();

    /// <summary>RN-007: un sensor inactivo no genera lecturas nuevas.</summary>
    public bool PuedeGenerarLecturas() => Estado == EstadoSensor.Activo;
}
