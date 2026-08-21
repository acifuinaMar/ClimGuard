using Application.JWT;
using Domain.Interfaces;
using MediatR;

namespace Application.Login.Service.Command
{
    public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResultDto>
    {
        private readonly ILogin _login;
        private readonly TokenService _token;

        public LoginCommandHandler(ILogin login, TokenService token)
        {
            _login = login;
            _token = token;
        }

        public async Task<LoginResultDto> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            var obj = await _login.IniciarSesion(request.NombreUsuario, request.Contraseña);
            return new LoginResultDto(
                obj.UsuarioId,
                _token.GenerateToken(obj.NombreUsuario, obj.Rol),
                obj.Mensaje
            );
        }
    }
}
