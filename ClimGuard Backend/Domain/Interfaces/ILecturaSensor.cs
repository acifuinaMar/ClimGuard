using Domain.Entities.SensorReading;

namespace Services.Services.Interfaces
{
    public interface ILecturaSensor
    {
        Task<IReadOnlyList<LecturaSensorDomain>> GetAll();
        Task<LecturaSensorDomain> GetById(int lectura);
        Task<LecturaSensorDomain> Create(LecturaSensorDomain lectura);
        Task<bool> Update(LecturaSensorDomain lectura);
        Task<bool> Delete(LecturaSensorDomain lectura);
    }
}
