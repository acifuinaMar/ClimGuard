using Domain.Entities.ReglaAlerta;

namespace Domain.Interfaces;

public interface IReglaAlerta
{
    Task<IReadOnlyList<ReglaAlertaDomain>> GetAll();

    Task<ReglaAlertaDomain> GetById(int reglaAlertaId);

    Task<ReglaAlertaDomain> GetByTipoSensor(int tipoSensorId);

    Task<ReglaAlertaDomain> Update(ReglaAlertaDomain reglaAlerta);
}