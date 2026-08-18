using Domain.Entities.AlertLevel;
using Domain.Entities.Comunity;
using Domain.Entities.PhenomenonType;
using Domain.Entities.Sensors;

namespace Domain.Entities.Alert;

public partial class AlertaDomain
{
    public AlertaDomain(int alertaId, int comunidadId, int sensorId, int tipoFenomenoId, int nivelAlertaId, string mensaje, DateTime fechaHora, bool activa, DateTime fechaResolucion)
    {
        AlertaId = alertaId;
        ComunidadId = comunidadId;
        SensorId = sensorId;
        TipoFenomenoId = tipoFenomenoId;
        NivelAlertaId = nivelAlertaId;
        Mensaje = mensaje;
        FechaHora = fechaHora;
        Activa = activa;
        FechaResolucion = fechaResolucion;
    }

    public int AlertaId { get; set; }

    public int ComunidadId { get; set; }

    public int SensorId { get; set; }

    public int TipoFenomenoId { get; set; }

    public int NivelAlertaId { get; set; }

    public string Mensaje { get; set; } = null!;

    public DateTime FechaHora { get; set; }

    public bool Activa { get; set; }

    public DateTime FechaResolucion { get; set; }

    public virtual ComunidadDomain Comunidad { get; set; } = null!;

    public virtual NivelAlertaDomain NivelAlerta { get; set; } = null!;

    public virtual SensorDomain? Sensor { get; set; }

    public virtual TipoFenomenoDomain TipoFenomeno { get; set; } = null!;
}
