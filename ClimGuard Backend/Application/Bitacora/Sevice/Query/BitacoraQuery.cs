using MediatR;

namespace Application.Bitacora.Sevice.Query
{
    public record BitacoraGetAllQuery() : IRequest<IReadOnlyList<BitacoraResultDto>>;
}
