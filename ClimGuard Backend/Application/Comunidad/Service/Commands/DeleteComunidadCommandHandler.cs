using Domain.Bitacora;
using Domain.Interfaces;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Comunidad.Service.Commands
{
    public sealed class DeleteComunidadCommandHandler : IRequestHandler<DeleteComunidadCommand, bool>
    {
        private readonly IComunidad _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;

        public DeleteComunidadCommandHandler(IComunidad repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
        }

        public async Task<bool> Handle(DeleteComunidadCommand request, CancellationToken cancellationToken)
        {
            // Buscar la comunidad
            var comunidad = await _repository.GetById(request.ComunidadId);

            if (comunidad == null)
            {
                return false;
            }

            var bitacora = new BitacoraDomain(
                0,
                request.UsuarioLogeado,
                $"Eliminacion de comunidad {request.ComunidadId}",
                DateTime.Now
                );
            await _repositoryBitacora.Create(bitacora);
            // Eliminar
            await _repository.Delete(comunidad);

            // Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return true;
        }
    }
}
