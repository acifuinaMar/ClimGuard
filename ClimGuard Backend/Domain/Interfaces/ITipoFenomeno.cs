using Domain.Entities.PhenomenonType;

namespace Services.Services.Interfaces
{
    public interface ITipoFenomeno
    {
        Task<IReadOnlyList<TipoFenomenoDomain>> GetAll();
        Task<TipoFenomenoDomain> GetById(int fenomeno);
        Task<TipoFenomenoDomain> Create(TipoFenomenoDomain fenomeno);
        Task<bool> Update(TipoFenomenoDomain fenomeno);
        Task Delete(TipoFenomenoDomain fenomeno);
    }
}
