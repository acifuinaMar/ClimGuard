using Domain.Entities.PhenomenonType;

namespace Domain.Interfaces;

public interface ITipoFenomeno
{
    Task<TipoFenomenoDomain> Create(TipoFenomenoDomain tipoFenomeno);

    Task<IReadOnlyList<TipoFenomenoDomain>> GetAll();

    Task<TipoFenomenoDomain> GetById(int tipoFenomenoId);

    Task<bool> Update(TipoFenomenoDomain tipoFenomeno);

    Task<bool> Delete(TipoFenomenoDomain tipoFenomeno);
}