using MediatR;

namespace Application.Comunidad.Service.Queries
{
    public record ComunidadGetAllQuery() : IRequest<IReadOnlyList<ComunidadResultDto>>;
    public record ComunidadGetByIdQuery(int id) : IRequest<ComunidadResultDto>;
}
