using Domain.Entities.Sensors;

namespace Services.Services.Interfaces
{
    public interface ISensor
    {
        Task<IReadOnlyList<SensorDomain>> GetAll();
        Task<SensorDomain> GetById(int sensor);
        Task<SensorDomain> Create(SensorDomain sensor);
        Task<bool> Update(SensorDomain sensor);
        Task<bool> Delete(SensorDomain sensor);
        Task<bool> SimularSensores();
    }
}
