using Domain.Bitacora;
using Domain.Interfaces;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Comunidad.Service.Commands
{
    public sealed class UpdateComunidadCommandHandler : IRequestHandler<UpdateComunidadCommand, ComunidadResultDto>
    {
        private readonly IComunidad _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;

        public UpdateComunidadCommandHandler(IComunidad repository,IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
        }

        public async Task<ComunidadResultDto> Handle(UpdateComunidadCommand request,CancellationToken cancellationToken)
        {
            //  Buscar la comunidad
            var comunidad = await _repository.GetById(request.ComunidadId);

            if (comunidad == null)
            {
                throw new KeyNotFoundException(
                    $"No se encontró la comunidad con ID {request.ComunidadId}");
            }

            //  Actualizar propiedades
            comunidad.ComunidadId = request.ComunidadId;
            comunidad.Nombre = request.Nombre;
            comunidad.Latitud = request.Latitud;
            comunidad.Longitud = request.Longitud;
            comunidad.Descripcion = request.Descripcion;
            comunidad.FechaRegistro = request.FechaRegistro;

            // Guardado en bitacora
            var bitacora = new BitacoraDomain(
                0,
                request.UsuarioLogeado,
                $"Actualiazción de comunidad {request.ComunidadId}",
                DateTime.Now
                );
            await _repositoryBitacora.Create(bitacora);

            //  Actualizar entidad
            await _repository.Update(comunidad);

            //  Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            //  Retornar resultado
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
