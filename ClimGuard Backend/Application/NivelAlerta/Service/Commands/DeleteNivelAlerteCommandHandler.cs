using Domain.Bitacora;
using Domain.Interfaces;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.NivelAlerta.Service.Commands
{
    public sealed class DeleteNivelAlerteCommandHandler : IRequestHandler<DeleteNivelAlertaCommand, bool>
    {
        private readonly INivelAlerta _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;

        public DeleteNivelAlerteCommandHandler(INivelAlerta repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
        }

        public async Task<bool> Handle(DeleteNivelAlertaCommand request, CancellationToken cancellationToken)
        {
            var nivelAlerta = await _repository.GetById(request.nivelAlertaId);
            if (nivelAlerta == null)
            {
                throw new InvalidOperationException("Nivel de alerta no encontrado");
            }

            var bitacora = new BitacoraDomain(
                0,
                "NivelAlerta",
                nivelAlerta.NivelAlertaId,
                "Eliminar",
                $"Eliminación de nivel de alerta {nivelAlerta.Nombre}",
                DateTime.Now,
                request.usuarioLogeado
            );

            await _repository.Delete(nivelAlerta);
            await _repositoryBitacora.Create(bitacora);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return true;
        }
    }
}
