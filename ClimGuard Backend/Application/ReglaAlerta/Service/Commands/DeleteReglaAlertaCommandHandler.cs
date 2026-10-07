using Domain.Bitacora;
using Domain.Interfaces;
using MediatR;
using tickets.Application.Common.UnitOfWork;

namespace Application.ReglaAlerta.Service.Commands
{
    public sealed class DeleteReglaAlertaCommandHandler : IRequestHandler<DeleteReglaAlertaCommand, bool>
    {
        private readonly IReglaAlerta _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;
        public DeleteReglaAlertaCommandHandler(IReglaAlerta repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
        }
        public async Task<bool> Handle(DeleteReglaAlertaCommand request, CancellationToken cancellationToken)
        {
            // Buscar la regla de alerta
            var reglaAlerta = await _repository.GetById(request.ReglaAlertaId);
            if (reglaAlerta == null)
            {
                return false;
            }
            var bitacora = new BitacoraDomain(
                0,
                "ReglaAlerta",
                reglaAlerta.ReglaAlertaId,
                "Eliminar",
                $"Eliminación de regla de alerta {reglaAlerta.Nombre}",
                DateTime.Now,
                request.UsuarioLogeado
                );
            await _repositoryBitacora.Create(bitacora);
            // Eliminar
            await _repository.Delete(reglaAlerta);
            // Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);
            return true;
        }
    }    
}

