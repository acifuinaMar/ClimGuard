using Domain.Entities.Comunity;

namespace Services.Services.Interfaces
{
    public interface IComunidad
    {
        Task<IReadOnlyList<ComunidadDomain>> GetAll();
        Task<ComunidadDomain> GetById(int comunidadId);
        Task<ComunidadDomain> Create(ComunidadDomain comunidad);
        Task<bool> Update(ComunidadDomain comunidad);
        Task<bool> Delete(ComunidadDomain comunidad);
    }
}
