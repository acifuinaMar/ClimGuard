using MediatR;

namespace Application.EstadoSensor.Service.Queries
{
    public record EstadoSensorGetAllQuery()
        : IRequest<IReadOnlyList<EstadoSensorResultDto>>;

    public record EstadoSensorGetByIdQuery(int id)
        : IRequest<EstadoSensorResultDto>;
}