using MediatR;

namespace Application.Usuario.Service
{
    public record CreateUsuarioCommand(
        string Apellido2,
        string Apellido1,
        string Nombre2,
        string Nombre1,
        string PasswordHash,
        string Rol,
        bool Activo,
        DateOnly FechaRegistro,
        int UsuarioLogeado
        ) : IRequest<UsuarioResultDto>;

    public record UpdateUsuarioCommand(
        int UsuarioId,
        string Apellido2,
        string Apellido1,
        string Nombre2,
        string Nombre1,
        string PasswordHash,
        string Rol,
        bool Activo,
        int UsuarioLogeado
        ) : IRequest<UsuarioResultDto>;

    public record DeleteUsuarioCommand(int id, int UsuarioLogeado) : IRequest<bool>;
}
