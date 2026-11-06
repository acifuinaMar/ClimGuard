using Domain.Entities.EstadoSensor;
using Domain.Interfaces;
using MediatR;
using tickets.Application.Common.UnitOfWork;

namespace Application.EstadoSensor.Service.Commands
{
    public sealed class CreateEstadoSensorCommandHandler : IRequestHandler<EstadoSensorCreateCommand, EstadoSensorResultDto>
    {
        private readonly IEstadoSensor _repository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateEstadoSensorCommandHandler(
            IEstadoSensor repository,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<EstadoSensorResultDto> Handle(
            EstadoSensorCreateCommand request,
            CancellationToken cancellationToken)
        {
            var estado = new EstadoSensorDomain(
                0,
                request.Nombre,
                request.Activo
            );

            await _repository.Create(estado);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return new EstadoSensorResultDto(
                estado.EstadoSensorId,
                estado.Nombre,
                estado.Activo
            );
        }
    }
}