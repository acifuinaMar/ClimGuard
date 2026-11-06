using MediatR;

namespace Application.NivelAlerta.Service
{
    public record CreateNivelAlertaCommand(
        int nivelAlertaId,
        string nombre,
        string colorHex,
        bool activo,
        int usuarioIng,
        DateTime fechaIng,
        int? usuarioAct,
        DateTime? fechaAct,
        int usuarioLogeado
    ) : IRequest<NivelAlertaResultDto>;


    public record UpdateNivelAlertaCommand(
        int nivelAlertaId,
        string nombre,
        string colorHex,
        bool activo,
        int usuarioIng,
        DateTime fechaIng,
        int? usuarioAct,
        DateTime? fechaAct,
        int usuarioLogeado
    ) : IRequest<NivelAlertaResultDto>;


    public record DeleteNivelAlertaCommand(
        int nivelAlertaId,
        int usuarioLogeado
    ) : IRequest<bool>;
}   

