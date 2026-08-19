using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Alerta.Service.Commands
{
    public sealed class AlertaDeleteCommandHandler : IRequestHandler<AlertDeleteCommand, bool>
    {
        private readonly IAlerta _repository;
        private readonly IUnitOfWork _unitOfWork;

        public AlertaDeleteCommandHandler(IAlerta repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<bool> Handle(AlertDeleteCommand request, CancellationToken cancellationToken)
        {
            // Buscar la alerta
            var alerta = await _repository.GetById(request.alertaId);

            if (alerta == null)
            {
                return false;
            }

            // Eliminar
            await _repository.Delete(alerta);

            // Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return true;
        }
    }
}
