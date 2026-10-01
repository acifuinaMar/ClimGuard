using Domain.Entities.SensorType;

namespace Domain.Interfaces;

public interface ITipoSensor
{
    Task<TipoSensorDomain> Create(TipoSensorDomain tipoSensor);

    Task<IReadOnlyList<TipoSensorDomain>> GetAll();

    Task<TipoSensorDomain> GetById(int tipoSensorId);

    Task<bool> Update(TipoSensorDomain tipoSensor);

    Task<bool> Delete(TipoSensorDomain tipoSensor);
}