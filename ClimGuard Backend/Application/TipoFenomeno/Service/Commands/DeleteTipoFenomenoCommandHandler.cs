using Domain.Bitacora;
using Domain.Interfaces;
using MediatR;
using tickets.Application.Common.UnitOfWork;

namespace Application.TipoFenomeno.Service.Commands
{
    public sealed class DeleteTipoFenomenoCommandHandler : IRequestHandler<DeleteTipoFenomenoCommand, bool>
    {
        private readonly ITipoFenomeno _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;
        public DeleteTipoFenomenoCommandHandler(ITipoFenomeno repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
        }
        public async Task<bool> Handle(DeleteTipoFenomenoCommand request, CancellationToken cancellationToken)
        {
            var tipoFenomeno = await _repository.GetById(request.TipoFenomenoId);
            if (tipoFenomeno == null)
            {
                return false;
            }
            var bitacora = new BitacoraDomain(
                0,
                "TipoFenomeno",
                tipoFenomeno.TipoFenomenoId,
                "Eliminar",
                $"Eliminación de tipo de fenómeno {tipoFenomeno.Nombre}",
                DateTime.Now,
                request.UsuarioLogeado
            );
            await _repository.Delete(tipoFenomeno);
            await _repositoryBitacora.Create(bitacora);
            await _unitOfWork.SaveChangeAsync(cancellationToken);
            return true;
        }
    }
}
