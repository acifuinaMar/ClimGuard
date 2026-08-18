using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Comunidad.Service.Commands
{
    public sealed class DeleteComunidadCommandHandler : IRequestHandler<DeleteComunidadCommand, bool>
    {
        private readonly IComunidad _repository;
        private readonly IUnitOfWork _unitOfWork;

        public DeleteComunidadCommandHandler(IComunidad repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> Handle(DeleteComunidadCommand request, CancellationToken cancellationToken)
        {
            // Buscar la comunidad
            var comunidad = await _repository.GetById(request.ComunidadId);

            if (comunidad == null)
            {
                return false;
            }

            // Eliminar
            await _repository.Delete(comunidad);

            // Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return true;
        }
    }
}
