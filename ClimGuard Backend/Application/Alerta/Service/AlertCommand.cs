using MediatR;

namespace Application.Alerta.Service
{
    public record AlertCreateCommand(
        int comunidadId, 
        int sensorId, 
        int tipoFenomenoId, 
        int nivelAlertaId, 
        string mensaje, 
        DateTime fechaHora, 
        bool activa, 
        DateTime fechaResolucion
        ) : IRequest<AlertaResultDto>;

    public record AlertUpdateCommand(
        int alertaId,
        int comunidadId,
        int sensorId,
        int tipoFenomenoId,
        int nivelAlertaId,
        string mensaje,
        DateTime fechaHora,
        bool activa,
        DateTime fechaResolucion
    ) : IRequest<AlertaResultDto>;

    public record AlertDeleteCommand(
        int alertaId
    ) : IRequest<bool>;
}