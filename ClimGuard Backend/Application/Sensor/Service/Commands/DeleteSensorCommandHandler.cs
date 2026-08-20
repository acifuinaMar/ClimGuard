using Domain.Bitacora;
using Domain.Interfaces;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Sensor.Service.Commands
{
    public sealed class DeleteSensorCommandHandler : IRequestHandler<DeleteSensorCommand, bool>
    {
        private readonly ISensor _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;

        public DeleteSensorCommandHandler(ISensor repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
        }

        public async Task<bool> Handle(DeleteSensorCommand request, CancellationToken cancellationToken)
        {
            // Buscar la comunidad
            var sensor = await _repository.GetById(request.SensorId);

            if (sensor == null)
            {
                return false;
            }

            //Guardado de bitacora
            var bitacora = new BitacoraDomain(
            0,
            request.UsuarioLogeado,
            $"Eliminacio de sensor {request.SensorId}",
            DateTime.Now
            );
            await _repositoryBitacora.Create(bitacora);

            // Eliminar
            await _repository.Delete(sensor);

            // Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return true;
        }
    }
}
