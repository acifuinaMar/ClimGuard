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
            var comunidad = new ComunidadDomain(
                0,
                request.NombreComunidad,
                request.Descripcion,
                request.Pais,
                request.Departamento,
                request.Municipio,
                request.Latitud,
                request.Longitud,
                request.Activo,
                request.UsuarioIng,
                request.FechaIng,
                request.UsuarioAct,
                request.FechaAct
            );


            var bitacora = new BitacoraDomain(
                0,
                request.UsuarioLogeado,
                $"Registro de nueva comunidad {request.NombreComunidad}",
                DateTime.Now
                );

            await _repository.Create(comunidad);
            await _repositoryBitacora.Create(bitacora);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return new ComunidadResultDto(
                comunidad.ComunidadId,
                comunidad.NombreComunidad,
                comunidad.Descripcion,
                comunidad.Pais,
                comunidad.Departamento,
                comunidad.Municipio,
                comunidad.Latitud,
                comunidad.Longitud,
                comunidad.Activo,
                comunidad.UsuarioIng,
                comunidad.FechaIng,
                comunidad.UsuarioAct,
                comunidad.FechaAct
                );
        }
    }
}
