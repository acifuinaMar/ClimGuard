using Domain.Entities.Comunity;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Comunidad.Service.Commands
{
    public sealed class CreateComunidadCommandHandler : IRequestHandler<CreateComunidadCommand, ComunidadResultDto>
    {
        private readonly IComunidad _repository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateComunidadCommandHandler(IComunidad repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<ComunidadResultDto> Handle(CreateComunidadCommand request, CancellationToken cancellationToken)
        {
            var comunidad = new ComunidadDomain (
                0,
                request.Nombre,
                request.Latitud,
                request.Longitud,
                request.Descripcion,
                request.FechaRegistro
            );
            await _repository.Create(comunidad);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return new ComunidadResultDto(
                comunidad.ComunidadId,
                comunidad.Nombre,
                comunidad.Latitud,
                comunidad.Longitud,
                comunidad.Descripcion,
                comunidad.FechaRegistro
                );
        }
    }
}
