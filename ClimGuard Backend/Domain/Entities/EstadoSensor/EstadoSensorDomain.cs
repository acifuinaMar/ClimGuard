namespace Domain.Entities.EstadoSensor;

public class EstadoSensorDomain
{
    public int EstadoSensorId { get; }

    public string Nombre { get; }

    public bool Activo { get; }

    public EstadoSensorDomain(
        int estadoSensorId,
        string nombre,
        bool activo)
    {
        EstadoSensorId = estadoSensorId;
        Nombre = nombre;
        Activo = activo;
    }
}