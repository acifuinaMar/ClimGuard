using Domain.Bitacora;
using Domain.Entities.Sensors;
using Domain.Interfaces;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Sensor.Service.Commands
{
    public sealed class CreateSensorCommandHandler : IRequestHandler<CreateSensorCommand, SensorResultDto>
    {
        private readonly ISensor _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;

        public CreateSensorCommandHandler(ISensor repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
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

            var bitacora = new BitacoraDomain(
                0,
                request.UsuarioLogeado,
                $"Registro de nuevo sensor {request.Nombre}",
                DateTime.Now
                );
            await _repositoryBitacora.Create(bitacora);

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
