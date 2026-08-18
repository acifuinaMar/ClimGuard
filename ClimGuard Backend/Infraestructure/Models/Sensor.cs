using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class Sensor
{
    public int SensorId { get; set; }

    public int ComunidadId { get; set; }

    public int TipoSensorId { get; set; }

    public string Nombre { get; set; } = null!;

    public decimal ValorActual { get; set; }

    public bool Activo { get; set; }

    public DateTime FechaInstalacion { get; set; }

    public DateTime UltimaActualizacion { get; set; }

    public virtual ICollection<Alerta> Alerta { get; set; } = new List<Alerta>();

    public virtual Comunidad Comunidad { get; set; } = null!;

    public virtual ICollection<LecturaSensor> LecturaSensors { get; set; } = new List<LecturaSensor>();

    public virtual TipoSensor TipoSensor { get; set; } = null!;
}
