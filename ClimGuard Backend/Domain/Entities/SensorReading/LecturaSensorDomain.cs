using Domain.Entities.Sensors;

namespace Domain.Entities.SensorReading;

public partial class LecturaSensorDomain
{
    public LecturaSensorDomain(long lecturaId, int sensorId, decimal valor, DateTime fechaHora)
    {
        LecturaId = lecturaId;
        SensorId = sensorId;
        Valor = valor;
        FechaHora = fechaHora;
    }

    public long LecturaId { get; set; }

    public int SensorId { get; set; }

    public decimal Valor { get; set; }

    public DateTime FechaHora { get; set; }

    public virtual SensorDomain Sensor { get; set; } = null!;
}
