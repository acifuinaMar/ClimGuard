using Domain.Entities.SensorType;

namespace Services.Services.Interfaces
{
    public interface ITipoSensor
    {
        Task<IReadOnlyList<TipoSensorDomain>> GetAll();
        Task<TipoSensorDomain> GetById(int tipo);
        Task<TipoSensorDomain> Create(TipoSensorDomain tipo);
        Task<bool> Update(TipoSensorDomain tipo);
        Task Delete(TipoSensorDomain tipo);
    }
}
