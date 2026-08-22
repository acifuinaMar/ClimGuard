using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class Umbral
{
    public int UmbralId { get; set; }

    public int TipoSensorId { get; set; }

    public decimal? ValorPrecaucion { get; set; }

    public decimal? ValorAlerta { get; set; }

    public decimal? ValorEmergencia { get; set; }

    public virtual TipoSensor TipoSensor { get; set; } = null!;
}