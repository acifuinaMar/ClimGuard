using MediatR;

namespace Application.Alerta.Service.Queries
{
    public record AlertaGetAllQuery() : IRequest<IReadOnlyList<AlertaResultDto>>;
    public record AlertaGetByIdQuery(int id) : IRequest<AlertaResultDto>;
}
