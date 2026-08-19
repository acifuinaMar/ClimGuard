using MediatR;

namespace Application.Usuario.Service
{
    public record CreateUsuarioCommand(
        string Apellido2,
        string Apellido1,
        string Nombre2,
        string Nombre1,
        string NombreUsuario,
        string PasswordHash,
        string Rol,
        bool Activo,
        DateOnly FechaRegistro
        ) : IRequest<UsuarioResultDto>;

    public record UpdateUsuarioCommand(
        int UsuarioId,
        string Apellido2,
        string Apellido1,
        string Nombre2,
        string Nombre1,
        string NombreUsuario,
        string PasswordHash,
        string Rol,
        bool Activo
        ) : IRequest<UsuarioResultDto>;

    public record DeleteUsuarioCommand(int id) : IRequest<bool>;
}
