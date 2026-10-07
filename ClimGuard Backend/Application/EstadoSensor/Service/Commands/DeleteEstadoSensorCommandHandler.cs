using Domain.Interfaces;
using MediatR;
using tickets.Application.Common.UnitOfWork;

namespace Application.EstadoSensor.Service.Commands
{
    public sealed class DeleteEstadoSensorCommandHandler
        : IRequestHandler<EstadoSensorDeleteCommand, bool>
    {
        private readonly IEstadoSensor _repository;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteEstadoSensorCommandHandler(
            IEstadoSensor repository,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> Handle(EstadoSensorDeleteCommand request,CancellationToken cancellationToken)
        {
            var estado = await _repository.GetById(request.EstadoSensorId);

            if (estado == null)
            {
                throw new KeyNotFoundException(
                    $"No se encontró el EstadoSensor con ID {request.EstadoSensorId}");
            }

            var eliminado = await _repository.Delete(estado);

            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return eliminado;
        }
    }
}