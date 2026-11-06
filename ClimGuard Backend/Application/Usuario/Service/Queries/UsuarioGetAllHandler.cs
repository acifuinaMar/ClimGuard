using MediatR;
using Domain.Interfaces;

namespace Application.Usuario.Service.Queries
{
    public sealed class UsuarioGetAllHandler : IRequestHandler<GetAllUsuarioQuery, IReadOnlyList<UsuarioResultDto>>
    {
        private readonly IUsuario _repository;

        public UsuarioGetAllHandler(IUsuario repository)
        {
            _repository = repository;
        }

        public async Task<IReadOnlyList<UsuarioResultDto>> Handle(
            GetAllUsuarioQuery request,
            CancellationToken cancellationToken)
        {
            var usuarios = await _repository.GetAll();

            return usuarios.Select(a => new UsuarioResultDto(
                a.UsuarioId,
                a.NombreCompleto,
                a.NombreUsuario,
                a.UltimoAcceso,
                a.Activo,
                a.RolId,
                a.UsuarioIng,
                a.FechaIng,
                a.UsuarioAct,
                a.FechaAct
            )).ToList();
        }
    }
}