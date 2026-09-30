namespace Application.Sensor;

public record SensorResultDto(
    int SensorId,
    string Nombre,
    string Codigo,
    string Ubicacion,
    string Descripcion,
    DateTime FechaInstalacion,
    DateTime FechaUltimaConexion,
    int ComunidadId,
    int TipoSensorId,
    int EstadoSensorId
);