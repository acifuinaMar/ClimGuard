using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class EstadoSensor
{
    public int EstadoSensorId { get; set; }

    public string Nombre { get; set; } = null!;

    public bool Activo { get; set; }

    public virtual ICollection<Sensor> Sensors { get; set; } = new List<Sensor>();
}