using Domain.Bitacora;
using Domain.Interfaces;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Usuario.Service.Commands
{
    public sealed class DeleteusuarioCommandHandler : IRequestHandler<DeleteUsuarioCommand, bool>
    {
        private readonly IUsuario _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;

        public DeleteusuarioCommandHandler(IUsuario repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
        }
        public async Task<bool> Handle(DeleteUsuarioCommand request, CancellationToken cancellationToken)
        {
            // Buscar usuario
            var usuario = await _repository.GetById(request.id);

            if (usuario == null)
            {
                return false;
            }

            // Guardado de bitacor
            var bitacora = new BitacoraDomain(
                0,
                request.UsuarioLogeado,
                $"Eliminacion de usuario {request.id}",
                DateTime.Now
                );
            await _repositoryBitacora.Create(bitacora);

            // Eliminar
            await _repository.Delete(usuario);

            // Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return true;
        }
    }
}
