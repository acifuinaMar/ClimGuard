using MediatR;

namespace Application.Usuario.Service
{
    public record CreateUsuarioCommand(
        string NombreCompleto,
        string NombreUsuario,
        string PasswordHash,
        bool Activo,
        int RolId,
        int UsuarioLogeado
    ) : IRequest<UsuarioResultDto>;

    public record UpdateUsuarioCommand(
        int UsuarioId,
        string NombreCompleto,
        string NombreUsuario,
        string PasswordHash,
        bool Activo,
        int RolId,
        int UsuarioLogeado
    ) : IRequest<UsuarioResultDto>;

    public record DeleteUsuarioCommand(
        int Id,
        int UsuarioLogeado
    ) : IRequest<bool>;
}