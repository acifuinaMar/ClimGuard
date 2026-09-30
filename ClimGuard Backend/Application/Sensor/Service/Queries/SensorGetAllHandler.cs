using MediatR;
using Services.Services.Interfaces;

namespace Application.Sensor.Service.Queries
{
    public sealed class SensorGetAllHandler : IRequestHandler<SensorGetAllQuery, IReadOnlyList<SensorResultDto>>
    {
        private readonly ISensor _repository;

        public SensorGetAllHandler(ISensor repository)
        {
            _repository = repository;
        }

        public async Task<IReadOnlyList<SensorResultDto>> Handle(SensorGetAllQuery request, CancellationToken cancellationToken)
        {
            var sensores = await _repository.GetAll();

            return sensores.Select(a => new SensorResultDto
            (
                a.SensorId,
                a.Nombre,
                a.Codigo,
                a.Ubicacion,
                a.Descripcion,
                a.FechaInstalacion,
                a.FechaUltimaConexion,
                a.Activo,
                a.ComunidadId,
                a.TipoSensorId,
                a.EstadoSensorId
            )).ToList();
        }
    }
}
