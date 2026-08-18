using MediatR;
using Services.Services.Interfaces;

namespace Application.Usuario.Service.Queries
{
    public sealed class UsuarioGetAllHandler : IRequestHandler<GetAllUsuarioQuery, IReadOnlyList<UsuarioResultDto>>
    {
        public readonly IUsuario _repository;

        public UsuarioGetAllHandler(IUsuario repository)
        {
            _repository = repository;
        }

        public async Task<IReadOnlyList<UsuarioResultDto>> Handle(GetAllUsuarioQuery request, CancellationToken cancellationToken)
        {
            var comunidades = await _repository.GetAll();

            return comunidades.Select(a => new UsuarioResultDto
            (
                a.UsuarioId,
                a.Apellido2,
                a.Apellido1,
                a.Nombre2,
                a.Nombre1,
                a.NombreUsuario,
                a.PasswordHash,
                a.Rol,
                a.Activo,
                a.FechaRegistro
            )).ToList();
        }
    }
}
