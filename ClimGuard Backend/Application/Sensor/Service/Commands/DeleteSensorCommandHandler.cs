using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Sensor.Service.Commands
{
    public sealed class DeleteSensorCommandHandler : IRequestHandler<DeleteSensorCommand, bool>
    {
        private readonly ISensor _repository;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteSensorCommandHandler(ISensor repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> Handle(DeleteSensorCommand request, CancellationToken cancellationToken)
        {
            // Buscar la comunidad
            var sensor = await _repository.GetById(request.SensorId);

            if (sensor == null)
            {
                return false;
            }

            // Eliminar
            await _repository.Delete(sensor);

            // Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return true;
        }
    }
}
