using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class EstadoSensor
{
    public int EstadoSensorId { get; set; }

    public string Estado { get; set; } = null!;
}
