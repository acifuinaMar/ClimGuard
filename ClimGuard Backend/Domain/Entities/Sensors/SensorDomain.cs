using Domain.Entities.Alert;
using Domain.Entities.Comunity;
using Domain.Entities.SensorReading;
using Domain.Entities.SensorType;
using Domain.Entities.EstadoSensor;

namespace Domain.Entities.Sensors;

public partial class SensorDomain
{
    public SensorDomain(
        int sensorId,
        string nombre,
        string codigo,
        string ubicacion,
        string descripcion,
        DateTime fechaInstalacion,
        DateTime fechaUltimaConexion,
        bool activo,
        int comunidadId,
        int tipoSensorId,
        int estadoSensorId)
    {
        SensorId = sensorId;
        Nombre = nombre;
        Codigo = codigo;
        Ubicacion = ubicacion;
        Descripcion = descripcion;
        FechaInstalacion = fechaInstalacion;
        FechaUltimaConexion = fechaUltimaConexion;
        Activo = activo;
        ComunidadId = comunidadId;
        TipoSensorId = tipoSensorId;
        EstadoSensorId = estadoSensorId;
    }

    public int SensorId { get; set; }

    public int ComunidadId { get; set; }

    public int TipoSensorId { get; set; }

    public string Nombre { get; set; } = null!;

    public bool Activo { get; set; }

    public DateTime FechaInstalacion { get; set; }

    public virtual ICollection<AlertaDomain> Alerta { get; set; } = new List<AlertaDomain>();

    public virtual ComunidadDomain Comunidad { get; set; } = null!;

    public virtual ICollection<LecturaSensorDomain> LecturaSensors { get; set; } = new List<LecturaSensorDomain>();

    public virtual TipoSensorDomain TipoSensor { get; set; } = null!;
    public virtual EstadoSensorDomain EstadoSensor { get; set; } = null!;
    public string Codigo { get; set; } = null!;

    public string Ubicacion { get; set; } = null!;

    public string Descripcion { get; set; } = null!;

    public DateTime FechaUltimaConexion { get; set; }

    public int EstadoSensorId { get; set; }
}
