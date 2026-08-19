using Domain.Entities.Alert;

namespace Services.Services.Interfaces
{
    public interface IAlerta
    {
        Task<IReadOnlyList<AlertaDomain>> GetAll();
        Task<AlertaDomain> GetById(int alerta);
        Task<AlertaDomain> Create(AlertaDomain alerta);
        Task<bool> Update(AlertaDomain alerta);
        Task<bool> Delete(AlertaDomain alerta);
    }
}
