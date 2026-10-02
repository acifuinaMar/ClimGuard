using Domain.Entities.AlertLevel;
using Domain.Entities.Comunity;
using Domain.Entities.PhenomenonType;
using Domain.Entities.Sensors;

namespace Domain.Entities.Alert;

public partial class AlertaDomain
{
    public AlertaDomain(
        int alertaId,
        decimal valorDetectado,
        string mensajeSnap,
        int nivelAlertaIdSnap,
        int tipoFenomenoIdSnap,
        DateTime fechaHora,
        bool activo,
        int sensorId,
        int comunidadId,
        int reglaAlertaId,
        int estadoAlertaId,
        int? usuarioResponsable)
    {
        AlertaId = alertaId;
        ValorDetectado = valorDetectado;
        MensajeSnap = mensajeSnap;
        NivelAlertaIdSnap = nivelAlertaIdSnap;
        TipoFenomenoIdSnap = tipoFenomenoIdSnap;
        FechaHora = fechaHora;
        Activo = activo;
        SensorId = sensorId;
        ComunidadId = comunidadId;
        ReglaAlertaId = reglaAlertaId;
        EstadoAlertaId = estadoAlertaId;
        UsuarioResponsable = usuarioResponsable;
    }

    public int AlertaId { get; set; }

    public int ComunidadId { get; set; }

    public int SensorId { get; set; }

    public int TipoFenomenoId { get; set; }

    public int NivelAlertaId { get; set; }

    public DateTime FechaHora { get; set; }

    public virtual ComunidadDomain Comunidad { get; set; } = null!;

    public virtual SensorDomain? Sensor { get; set; }

    public decimal ValorDetectado { get; set; }

    public string MensajeSnap { get; set; } = null!;

    public int NivelAlertaIdSnap { get; set; }

    public int TipoFenomenoIdSnap { get; set; }

    public bool Activo { get; set; }

    public int ReglaAlertaId { get; set; }

    public int EstadoAlertaId { get; set; }

    public int? UsuarioResponsable { get; set; }
}
