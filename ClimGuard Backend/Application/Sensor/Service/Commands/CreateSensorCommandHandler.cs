using Domain.Entities.Sensors;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Sensor.Service.Commands
{
    public sealed class CreateSensorCommandHandler : IRequestHandler<CreateSensorCommand, SensorResultDto>
    {
        private readonly ISensor _repository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateSensorCommandHandler(ISensor repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<SensorResultDto> Handle(CreateSensorCommand request, CancellationToken cancellationToken)
        {
            var sensor = new SensorDomain(
                0,
                request.ComunidadId,
                request.TipoSensorId,
                request.Nombre,
                request.ValorActual,
                request.Activo,
                request.FechaInstalacion,
                request.UltimaActualizacion
            );
            await _repository.Create(sensor);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

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
