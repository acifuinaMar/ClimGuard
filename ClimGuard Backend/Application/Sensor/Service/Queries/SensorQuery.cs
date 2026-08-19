using MediatR;

namespace Application.Sensor.Service.Queries
{
    public record SensorGetAllQuery() : IRequest<IReadOnlyList<SensorResultDto>>;
    public record SensorGetByIdQuery(int id) : IRequest<SensorResultDto>;
}
