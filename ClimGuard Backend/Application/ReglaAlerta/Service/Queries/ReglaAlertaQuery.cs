using MediatR;

namespace Application.ReglaAlerta.Service.Queries
{
    public record ReglaAlertaGetAllQuery() : IRequest<IReadOnlyList<ReglaAlertaResultDto>>;
    public record ReglaAlertaGetByIdQuery(int id) : IRequest<ReglaAlertaResultDto>;
}
