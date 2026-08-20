using Domain.Bitacora;

namespace Domain.Interfaces
{
    public interface IBitacora
    {
        Task<IReadOnlyList<BitacoraDomain>> GetAll();
        Task<bool> Create(BitacoraDomain bitacora);
    }
}
