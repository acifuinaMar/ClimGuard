using Domain.Entities.ReglaAlerta;

namespace Domain.Interfaces;

public interface IReglaAlerta
{
    Task<IReadOnlyList<ReglaAlertaDomain>> GetAll();

    Task<ReglaAlertaDomain> GetById(int reglaAlertaId);

    Task<ReglaAlertaDomain> GetByTipoSensor(int tipoSensorId);

    Task<ReglaAlertaDomain> Create(ReglaAlertaDomain reglaAlerta);
    Task<ReglaAlertaDomain> Update(ReglaAlertaDomain reglaAlerta);
    Task<bool> Delete(ReglaAlertaDomain reglaAlerta);
}