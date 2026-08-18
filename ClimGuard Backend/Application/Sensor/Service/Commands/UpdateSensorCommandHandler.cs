using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Sensor.Service.Commands
{
    public sealed class UpdateSensorCommandHandler : IRequestHandler<UpdateSensorCommand, SensorResultDto>
    {
        private readonly ISensor _repository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateSensorCommandHandler(ISensor repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<SensorResultDto> Handle(UpdateSensorCommand request, CancellationToken cancellationToken)
        {
            // 1. Buscar sensor
            var sensor = await _repository.GetById(request.SensorId);

            if (sensor == null)
            {
                throw new KeyNotFoundException(
                    $"No se encontró la comunidad con ID {request.ComunidadId}");
            }

            // 2. Actualizar propiedades
            //sensor.SensorId = sensorId;
            sensor.ComunidadId = request.ComunidadId;
            sensor.TipoSensorId = request.TipoSensorId;
            sensor.Nombre = request.Nombre;
            sensor.ValorActual = request.ValorActual;
            sensor.Activo = request.Activo;
            sensor.FechaInstalacion = request.FechaInstalacion;
            sensor.UltimaActualizacion = request.UltimaActualizacion;
            

            // 3. Actualizar entidad
            await _repository.Update(sensor);

            // 4. Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            // 5. Retornar resultado
            return new SensorResultDto(
                sensor.SensorId,
                sensor.ComunidadId,
                sensor.TipoSensorId,
                sensor.Nombre,
                sensor.ValorActual,
                sensor.Activo,
                sensor.FechaInstalacion,
                sensor.UltimaActualizacion
                );
        }
    }
}
