using MediatR;
using Services.Services.Interfaces;

namespace Application.Usuario.Service.Queries
{
    public sealed class UsuarioGetByIdHandler : IRequestHandler<GetByIdUsuarioQuery, UsuarioResultDto>
    {
        private readonly IUsuario _repository;

        public UsuarioGetByIdHandler(IUsuario repository)
        {
            _repository = repository;
        }

        public async Task<UsuarioResultDto> Handle(GetByIdUsuarioQuery request, CancellationToken cancellationToken)
        {
            var usuario = await _repository.GetById(request.id);

            return new UsuarioResultDto(
                usuario.UsuarioId,
                usuario.Apellido2,
                usuario.Apellido1,
                usuario.Nombre2,
                usuario.Nombre1,
                usuario.NombreUsuario,
                usuario.PasswordHash,
                usuario.Rol,
                usuario.Activo,
                usuario.FechaRegistro
                );
        }
    }
}
