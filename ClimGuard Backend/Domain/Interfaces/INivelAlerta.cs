using Domain.Entities.AlertLevel;

namespace Services.Services.Interfaces
{
    public interface INivelAlerta
    {
        Task<IReadOnlyList<NivelAlertaDomain>> GetAll();
        Task<NivelAlertaDomain> GetById(int nivel);
        Task<NivelAlertaDomain> Create(NivelAlertaDomain nivel);
        Task<bool> Update(NivelAlertaDomain nivel);
        Task<bool> Delete(NivelAlertaDomain nivel);
    }
}
