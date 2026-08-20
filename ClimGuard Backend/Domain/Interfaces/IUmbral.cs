using Domain.Entities.Umbral;

namespace Domain.Interfaces
{
    public interface IUmbral
    {
        Task<IReadOnlyList<UmbralDomain>> GetAll();

        Task<UmbralDomain> GetByTipoSensor(int tipoSensorId);

        Task<UmbralDomain> Update(UmbralDomain umbral);
    }
}