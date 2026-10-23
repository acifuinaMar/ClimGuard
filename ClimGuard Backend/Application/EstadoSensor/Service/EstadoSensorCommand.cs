using MediatR;

namespace Application.EstadoSensor.Service;

public record EstadoSensorCreateCommand(
    string Nombre,
    bool Activo
) : IRequest<EstadoSensorResultDto>;

public record EstadoSensorUpdateCommand(
    int EstadoSensorId,
    string Nombre,
    bool Activo
) : IRequest<EstadoSensorResultDto>;

public record EstadoSensorDeleteCommand(
    int EstadoSensorId
) : IRequest<bool>;