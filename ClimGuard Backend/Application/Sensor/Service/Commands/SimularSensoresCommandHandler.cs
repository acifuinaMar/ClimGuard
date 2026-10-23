using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Sensor.Service.Commands
{
    public sealed class SimularSensoresCommandHandler
        : IRequestHandler<SimularSensoresCommand, bool>
    {
        private readonly ISensor _repository;
        private readonly IUnitOfWork _unitOfWork;

        public SimularSensoresCommandHandler(
            ISensor repository,
            IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> Handle(
            SimularSensoresCommand request,
            CancellationToken cancellationToken)
        {
            var resultado = await _repository.SimularSensores();

            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return resultado;
        }
    }
}