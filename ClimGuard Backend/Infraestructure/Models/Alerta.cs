using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class Alerta
{
    public long AlertaId { get; set; }

    public decimal ValorDetectado { get; set; }

    public string MensajeSnap { get; set; } = null!;

    public int NivelAlertaIdSnap { get; set; }

    public int TipoFenomenoIdSnap { get; set; }

    public DateTime FechaHora { get; set; }

    public bool Activo { get; set; }

    public int SensorId { get; set; }

    public int ComunidadId { get; set; }

    public int ReglaAlertaId { get; set; }

    public int EstadoAlertaId { get; set; }

    public int? UsuarioResponsable { get; set; }

    public virtual Comunidad Comunidad { get; set; } = null!;

    public virtual Sensor Sensor { get; set; } = null!;

    public virtual ReglaAlerta ReglaAlerta { get; set; } = null!;

    public virtual EstadoAlerta EstadoAlerta { get; set; } = null!;

    public virtual Usuario? UsuarioResponsableNavigation { get; set; }
}