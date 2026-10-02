using MediatR;

namespace Application.Sensor.Service
{
    public record CreateSensorCommand(
            int SensorId,
            int ComunidadId,
            int TipoSensorId,
            string Nombre,
            decimal ValorActual,
            bool Activo,
            DateTime FechaInstalacion,
            DateTime UltimaActualizacion,
            int UsuarioLogeado
        ) : IRequest<SensorResultDto>;

    public record UpdateSensorCommand(
        int SensorId,
        int ComunidadId,
        int TipoSensorId,
        string Nombre,
        decimal ValorActual,
        bool Activo,
        DateTime FechaInstalacion,
        DateTime UltimaActualizacion,
        int UsuarioLogeado
    ) : IRequest<SensorResultDto>;

    public record DeleteSensorCommand(
        int SensorId,
        int UsuarioLogeado
    ) : IRequest<bool>;

    public record SimularSensoresCommand() : IRequest<bool>;
}