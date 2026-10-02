namespace Application.Sensor
{
    public record SensorResultDto(
            int SensorId,
            int ComunidadId,
            int TipoSensorId,
            string Nombre,
            decimal ValorActual,
            bool Activo,
            DateTime FechaInstalacion,
            DateTime UltimaActualizacion
        );
}
