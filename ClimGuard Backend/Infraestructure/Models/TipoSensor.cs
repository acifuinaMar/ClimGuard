using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class TipoSensor
{
    public int TipoSensorId { get; set; }

    public string Nombre { get; set; } = null!;

    public string UnidadMedida { get; set; } = null!;

    public virtual ICollection<Sensor> Sensors { get; set; } = new List<Sensor>();
    public virtual ICollection<Umbral> Umbrals { get; set; } = new List<Umbral>();
}
