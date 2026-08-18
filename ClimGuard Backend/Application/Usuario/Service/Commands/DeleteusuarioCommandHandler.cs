using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Usuario.Service.Commands
{
    public sealed class DeleteusuarioCommandHandler : IRequestHandler<DeleteUsuarioCommand, bool>
    {
        private readonly IUsuario _repository;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteusuarioCommandHandler(IUsuario repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<bool> Handle(DeleteUsuarioCommand request, CancellationToken cancellationToken)
        {
            // Buscar usuario
            var usuario = await _repository.GetById(request.id);

            if (usuario == null)
            {
                return false;
            }

            // Eliminar
            await _repository.Delete(usuario);

            // Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return true;
        }
    }
}
