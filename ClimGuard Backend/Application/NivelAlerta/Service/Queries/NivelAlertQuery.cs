using MediatR;

namespace Application.NivelAlerta.Service.Queries
{
    public record NivelAlertaGetAllQuery() : IRequest<IReadOnlyList<NivelAlertaResultDto>>;
    public record NivelAlertaGetByIdQuery(int id) : IRequest<NivelAlertaResultDto>;
}
