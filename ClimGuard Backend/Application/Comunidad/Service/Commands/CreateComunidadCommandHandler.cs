using Domain.Bitacora;
using Domain.Entities.Comunity;
using Domain.Interfaces;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Comunidad.Service.Commands
{
    public sealed class CreateComunidadCommandHandler : IRequestHandler<CreateComunidadCommand, ComunidadResultDto>
    {
        private readonly IComunidad _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;


        public CreateComunidadCommandHandler(IComunidad repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
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


            var bitacora = new BitacoraDomain(
                0,
                request.UsuarioLogeado,
                $"Registro de nueva comunidad {request.Nombre}",
                DateTime.Now
                );

            await _repository.Create(comunidad);
            await _repositoryBitacora.Create(bitacora);
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
