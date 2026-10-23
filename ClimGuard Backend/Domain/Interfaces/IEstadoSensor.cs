using Domain.Entities.EstadoSensor;

namespace Domain.Interfaces;

public interface IEstadoSensor
{
    Task<EstadoSensorDomain> Create(EstadoSensorDomain estadoSensor);

    Task<IReadOnlyList<EstadoSensorDomain>> GetAll();

    Task<EstadoSensorDomain> GetById(int estadoSensorId);

    Task<bool> Update(EstadoSensorDomain estadoSensor);

    Task<bool> Delete(EstadoSensorDomain estadoSensor);
}