namespace Application.Sensor;

public record SensorResultDto(
    int SensorId,
    string Nombre,
    string Codigo,
    string Ubicacion,
    string Descripcion,
    DateTime FechaInstalacion,
    DateTime FechaUltimaConexion,
    decimal valorActual,
    int ComunidadId,
    int TipoSensorId,
    int EstadoSensorId,
    int UsuarioIng,
    DateTime FechaIng,
    int? UsuarioAct,
    DateTime? FechaAct
);