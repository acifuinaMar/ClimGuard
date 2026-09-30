using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class Sensor
{
    public int SensorId { get; set; }

    public string Nombre { get; set; } = null!;

    public string Codigo { get; set; } = null!;

    public string Ubicacion { get; set; } = null!;

    public string Descripcion { get; set; } = null!;

    public DateTime FechaInstalacion { get; set; }

    public DateTime FechaUltimaConexion { get; set; }

    public bool Activo { get; set; }

    public int ComunidadId { get; set; }

    public int TipoSensorId { get; set; }

    public int EstadoSensorId { get; set; }

    public virtual ICollection<Alerta> Alerta { get; set; } = new List<Alerta>();

    public virtual Comunidad Comunidad { get; set; } = null!;

    public virtual ICollection<LecturaSensor> LecturaSensors { get; set; } = new List<LecturaSensor>();

    public virtual TipoSensor TipoSensor { get; set; } = null!;

    public virtual EstadoSensor EstadoSensor { get; set; } = null!;
}