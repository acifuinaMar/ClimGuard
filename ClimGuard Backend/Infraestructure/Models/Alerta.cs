using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class Alerta
{
    public long AlertaId { get; set; }

    public int ComunidadId { get; set; }

    public int SensorId { get; set; }

    public int TipoFenomenoId { get; set; }

    public int NivelAlertaId { get; set; }

    public string Mensaje { get; set; } = null!;

    public DateTime FechaHora { get; set; }

    public bool Activa { get; set; }

    public DateTime? FechaResolucion { get; set; }

    public virtual Comunidad Comunidad { get; set; } = null!;

    public virtual NivelAlerta NivelAlerta { get; set; } = null!;

    public virtual Sensor? Sensor { get; set; }

    public virtual TipoFenomeno TipoFenomeno { get; set; } = null!;
}
