using Domain.Interfaces;
using MediatR;

namespace Application.Login.Service.Command
{
    public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResultDto>
    {
        private readonly ILogin _login;

        public LoginCommandHandler(ILogin login)
        {
            _login = login;
        }

        public async Task<LoginResultDto> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var obj = await _login.IniciarSesion(request.NombreUsuario, request.Contraseña);
            return new LoginResultDto(
                obj.usuario,
                obj.Token,
                obj.Mensaje
                );
        }
    }
}
