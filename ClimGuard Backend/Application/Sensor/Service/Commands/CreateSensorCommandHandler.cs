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
                request.Nombre,
                request.Codigo,
                request.Ubicacion,
                request.Descripcion,
                request.FechaInstalacion,
                request.FechaUltimaConexion,
                request.ComunidadId,
                request.TipoSensorId,
                request.EstadoSensorId,
                request.UsuarioLogeado,      // UsuarioIng
                DateTime.Now,                // FechaIng
                null,                        // UsuarioAct
                null                         // FechaAct
            );

            var bitacora = new BitacoraDomain(
                0,
                "Sensor",
                sensor.SensorId,
                "Crear",
                $"Registro del sensor {sensor.Nombre}",
                DateTime.Now,
                request.UsuarioLogeado
            );
            await _repositoryBitacora.Create(bitacora);

            await _repository.Create(sensor);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

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
