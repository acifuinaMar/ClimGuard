using Domain.Entities.Sensors;

namespace Domain.Entities.SensorType;

public partial class TipoSensorDomain
{
    public int TipoSensorId { get; set; }

    public string Nombre { get; set; } = null!;

    public string UnidadMedida { get; set; } = null!;

    public virtual ICollection<SensorDomain> Sensors { get; set; } = new List<SensorDomain>();
}
