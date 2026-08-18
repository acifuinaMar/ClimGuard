using MediatR;

namespace Application.Usuario.Service.Queries
{
    public record GetAllUsuarioQuery() : IRequest<IReadOnlyList<UsuarioResultDto>>;
    public record GetByIdUsuarioQuery(int id) : IRequest<UsuarioResultDto>;
}
