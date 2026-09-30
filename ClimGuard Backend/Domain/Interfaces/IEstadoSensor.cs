using Domain.Entities.EstadoSensor;

namespace Domain.Interfaces;

public interface IEstadoSensor
{
    Task<IReadOnlyList<EstadoSensorDomain>> GetAll();

    Task<EstadoSensorDomain> GetById(int estadoSensorId);

    Task<EstadoSensorDomain> Update(EstadoSensorDomain estadoSensor);
}