using Application.Comunidad;
using MediatR;

namespace Application.TipoFenomeno.Service.Queries
{
    public record TipoFenomenoGetAllQuery() : IRequest<IReadOnlyList<TipoFenomenoResultDto>>;
    public record TipoFenomenoGetByIdQuery(int id) : IRequest<TipoFenomenoResultDto >;
}
