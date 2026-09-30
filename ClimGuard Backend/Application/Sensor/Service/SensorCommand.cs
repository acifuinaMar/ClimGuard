using MediatR;

namespace Application.Sensor.Service
{
    public record CreateSensorCommand(
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
        int EstadoSensorId,
        int UsuarioLogeado
    ) : IRequest<SensorResultDto>;

    public record UpdateSensorCommand(
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
        int EstadoSensorId,
        int UsuarioLogeado
    ) : IRequest<SensorResultDto>;

    public record DeleteSensorCommand(
        int SensorId,
        int UsuarioLogeado
    ) : IRequest<bool>;

    public record SimularSensoresCommand() : IRequest<bool>;
}