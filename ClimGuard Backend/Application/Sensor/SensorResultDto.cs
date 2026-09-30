namespace Application.Sensor;

public record SensorResultDto(
    int SensorId,
    string Nombre,
    string Codigo,
    string Ubicacion,
    string Descripcion,
    DateTime FechaInstalacion,
    DateTime FechaUltimaConexion,
    bool Activo,
    int ComunidadId,
    int TipoSensorId,
    int EstadoSensorId
);