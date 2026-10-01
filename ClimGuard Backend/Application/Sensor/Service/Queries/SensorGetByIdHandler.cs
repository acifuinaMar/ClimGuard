using MediatR;
using Services.Services.Interfaces;

namespace Application.Sensor.Service.Queries
{
    public sealed class SensorGetByIdHandler : IRequestHandler<SensorGetByIdQuery, SensorResultDto>
    {
        private readonly ISensor _repository;

        public SensorGetByIdHandler(ISensor repository)
        {
            _repository = repository;
        }

        public async Task<SensorResultDto> Handle(SensorGetByIdQuery request, CancellationToken cancellationToken)
        {
            var sensor = await _repository.GetById(request.id);

            return new SensorResultDto(
                sensor.SensorId,
                sensor.Nombre,
                sensor.Codigo,
                sensor.Ubicacion,
                sensor.Descripcion,
                sensor.FechaInstalacion,
                sensor.FechaUltimaConexion,
                sensor.ComunidadId,
                sensor.TipoSensorId,
                sensor.EstadoSensorId,
                sensor.UsuarioIng,
                sensor.FechaIng,
                sensor.UsuarioAct,
                sensor.FechaAct
            );
        }
    }
}
