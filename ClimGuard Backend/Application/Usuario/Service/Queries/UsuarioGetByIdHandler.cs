using MediatR;
using Domain.Interfaces;

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

            if(usuario == null)
                return null;

            return new UsuarioResultDto(
                usuario.UsuarioId,
                usuario.NombreCompleto,
                usuario.NombreUsuario,
                usuario.UltimoAcceso,
                usuario.Activo,
                usuario.RolId,
                usuario.UsuarioIng,
                usuario.FechaIng,
                usuario.UsuarioAct,
                usuario.FechaAct
            );
        }
    }
}