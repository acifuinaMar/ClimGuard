using Domain.Entities.EstadoSensor;
using Domain.Interfaces;
using MediatR;
using tickets.Application.Common.UnitOfWork;

namespace Application.EstadoSensor.Service.Commands
{
    public sealed class UpdateEstadoSensorCommandHandler : IRequestHandler<EstadoSensorUpdateCommand, EstadoSensorResultDto>
    {
        private readonly IEstadoSensor _repository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateEstadoSensorCommandHandler(
            IEstadoSensor repository,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<EstadoSensorResultDto> Handle(
            EstadoSensorUpdateCommand request,
            CancellationToken cancellationToken)
        {
            var estado = await _repository.GetById(request.EstadoSensorId);

            if (estado == null)
            {
                throw new KeyNotFoundException(
                    $"No se encontró el EstadoSensor con ID {request.EstadoSensorId}");
            }

            estado = new EstadoSensorDomain(
                request.EstadoSensorId,
                request.Nombre,
                request.Activo
            );

            await _repository.Update(estado);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return new EstadoSensorResultDto(
                estado.EstadoSensorId,
                estado.Nombre,
                estado.Activo
            );
        }
    }
}