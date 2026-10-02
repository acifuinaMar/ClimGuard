using Domain.Bitacora;
using Domain.Interfaces;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Sensor.Service.Commands
{
    public sealed class UpdateSensorCommandHandler : IRequestHandler<UpdateSensorCommand, SensorResultDto>
    {
        private readonly ISensor _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;

        public UpdateSensorCommandHandler(ISensor repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
        }

        public async Task<SensorResultDto> Handle(UpdateSensorCommand request, CancellationToken cancellationToken)
        {
            // Buscar sensor
            var sensor = await _repository.GetById(request.SensorId);

            if (sensor == null)
            {
                throw new KeyNotFoundException(
                    $"No se encontró la comunidad con ID {request.ComunidadId}");
            }

            //  Actualizar propiedades
            //sensor.SensorId = sensorId;
            sensor.ComunidadId = request.ComunidadId;
            sensor.TipoSensorId = request.TipoSensorId;
            sensor.Nombre = request.Nombre;
            sensor.ValorActual = request.ValorActual;
            sensor.Activo = request.Activo;
            sensor.FechaInstalacion = request.FechaInstalacion;
            sensor.UltimaActualizacion = request.UltimaActualizacion;



            var bitacora = new BitacoraDomain(
                0,
                request.UsuarioLogeado,
                $"Actualizacion de sensor {request.Nombre}",
                DateTime.Now
                );
            await _repositoryBitacora.Create(bitacora);

            //  Actualizar entidad
            await _repository.Update(sensor);

            // Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            //  Retornar resultado
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
