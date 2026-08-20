using Domain.Bitacora;
using Domain.Interfaces;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Alerta.Service.Commands
{
    public sealed class AlertaDeleteCommandHandler : IRequestHandler<AlertDeleteCommand, bool>
    {
        private readonly IAlerta _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;

        public AlertaDeleteCommandHandler(IAlerta repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
        }
        public async Task<bool> Handle(AlertDeleteCommand request, CancellationToken cancellationToken)
        {
            // Buscar la alerta
            var alerta = await _repository.GetById(request.alertaId);

            if (alerta == null)
            {
                return false;
            }


            var bitacora = new BitacoraDomain(
                0,
                request.UsuarioLogeado,
                $"Eliminacion de alerta {request.alertaId}",
                DateTime.Now
                );
            await _repositoryBitacora.Create(bitacora);
            // Eliminar
            await _repository.Delete(alerta);

            // Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return true;
        }
    }
}
