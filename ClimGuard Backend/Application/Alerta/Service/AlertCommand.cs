using MediatR;

namespace Application.Alerta.Service
{
    public record AlertCreateCommand(
        decimal valorDetectado,
        string mensajeSnap,
        int nivelAlertaIdSnap,
        int tipoFenomenoIdSnap,
        DateTime fechaHora,
        bool activo,
        int sensorId,
        int comunidadId,
        int reglaAlertaId,
        int estadoAlertaId,
        int? usuarioResponsable,
        int UsuarioLogeado
    ) : IRequest<AlertaResultDto>;

    public record AlertUpdateCommand(
        int alertaId,
        decimal valorDetectado,
        string mensajeSnap,
        int nivelAlertaIdSnap,
        int tipoFenomenoIdSnap,
        DateTime fechaHora,
        bool activo,
        int sensorId,
        int comunidadId,
        int reglaAlertaId,
        int estadoAlertaId,
        int? usuarioResponsable,
        int UsuarioLogeado
    ) : IRequest<AlertaResultDto>;

    public record AlertDeleteCommand(
        int alertaId,
        int UsuarioLogeado
    ) : IRequest<bool>;
}