namespace Application.EstadoSensor;

public record EstadoSensorResultDto(
    int EstadoSensorId,
    string Nombre,
    bool Activo
);