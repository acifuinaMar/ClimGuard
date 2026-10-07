using MediatR;

namespace Application.ReglaAlerta.Service
{
    public record CreateReglaAlertaCommand(
        int reglaAlertaId,
        string nombre,
        decimal valorMin,
        decimal valorMax,
        string mensaje,
        bool activo,
        int tipoSensorId,
        int tipoFenomenoId,
        int nivelAlertaId,
        int usuarioIng,
        DateTime fechaIng,
        int usuarioAct, 
        DateTime fechaAct,
        int usuarioLogeado
    ) : IRequest<ReglaAlertaResultDto>;


    public record UpdateReglaAlertaCommand(
        int reglaAlertaId,
        string nombre,
        decimal valorMin,
        decimal valorMax,
        string mensaje,
        bool activo,
        int tipoSensorId,
        int tipoFenomenoId,
        int nivelAlertaId,
        int usuarioIng,
        DateTime fechaIng,
        int usuarioAct, 
        DateTime fechaAct,
        int usuarioLogeado
    ) : IRequest<ReglaAlertaResultDto>;


    public record DeleteReglaAlertaCommand(
        int ReglaAlertaId,
        int UsuarioLogeado
    ) : IRequest<bool>;
}
