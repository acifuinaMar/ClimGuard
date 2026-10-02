using Domain.Entities.Alert;
using Domain.Entities.Comunity;
using Domain.Entities.SensorReading;
using Domain.Entities.SensorType;

namespace Domain.Entities.Sensors;

public partial class SensorDomain
{
    public SensorDomain(int sensorId, int comunidadId, int tipoSensorId, string nombre, decimal valorActual, bool activo, DateTime fechaInstalacion, DateTime ultimaActualizacion)
    {
        SensorId = sensorId;
        ComunidadId = comunidadId;
        TipoSensorId = tipoSensorId;
        Nombre = nombre;
        ValorActual = valorActual;
        Activo = activo;
        FechaInstalacion = fechaInstalacion;
        UltimaActualizacion = ultimaActualizacion;
    }

    public int SensorId { get; set; }

    public int ComunidadId { get; set; }

    public int TipoSensorId { get; set; }

    public string Nombre { get; set; } = null!;

    public decimal ValorActual { get; set; }

    public bool Activo { get; set; }

    public DateTime FechaInstalacion { get; set; }

    public DateTime UltimaActualizacion { get; set; }

    public virtual ICollection<AlertaDomain> Alerta { get; set; } = new List<AlertaDomain>();

    public virtual ComunidadDomain Comunidad { get; set; } = null!;

    public virtual ICollection<LecturaSensorDomain> LecturaSensors { get; set; } = new List<LecturaSensorDomain>();

    public virtual TipoSensorDomain TipoSensor { get; set; } = null!;
}
