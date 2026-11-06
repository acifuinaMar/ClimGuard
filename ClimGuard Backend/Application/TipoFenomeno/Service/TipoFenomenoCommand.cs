using MediatR;

namespace Application.TipoFenomeno.Service
{
    public record CreateTipoFenomenoCommand
    (
        int TipoFenomenoId,
        string Nombre,
        bool Activo,
        int UsuarioIng,
        DateTime FechaIng,
        int UsuarioAct,
        DateTime FechaAct,
        int UsuarioLogeado
    ) : IRequest<TipoFenomenoResultDto>;

    public record UpdateTipoFenomenoCommand
    (
        int TipoFenomenoId,
        string Nombre,
        bool Activo,
        int UsuarioIng,
        DateTime FechaIng,
        int UsuarioAct,
        DateTime FechaAct,
        int UsuarioLogeado
    ) : IRequest<TipoFenomenoResultDto>;


    public record DeleteTipoFenomenoCommand
    (
        int TipoFenomenoId,
        int UsuarioLogeado
    ) : IRequest<bool>;
}
