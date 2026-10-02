using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class LecturaSensor
{
    public long LecturaId { get; set; }

    public int SensorId { get; set; }

    public decimal Valor { get; set; }

    public DateTime FechaHora { get; set; }

    public int UsuarioIng { get; set; }

    public virtual Sensor Sensor { get; set; } = null!;

    public virtual Usuario UsuarioIngNavigation { get; set; } = null!;
}