using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class LecturaSensor
{
    public long LecturaId { get; set; }

    public int SensorId { get; set; }

    public decimal Valor { get; set; }

    public DateTime FechaHora { get; set; }

    public virtual Sensor Sensor { get; set; } = null!;
}
