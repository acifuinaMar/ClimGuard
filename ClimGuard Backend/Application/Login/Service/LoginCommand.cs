using MediatR;

namespace Application.Login.Service
{
    public record LoginCommand(
        string NombreUsuario,
        string Contraseña
        ) : IRequest<LoginResultDto>;
}
