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
            comunidad.NombreComunidad = request.NombreComunidad;
            comunidad.Descripcion = request.Descripcion;
            comunidad.Pais = request.Pais;
            comunidad.Departamento = request.Departamento;
            comunidad.Municipio = request.Municipio;
            comunidad.Latitud = request.Latitud;
            comunidad.Longitud = request.Longitud;
            comunidad.Activo = request.Activo;
            comunidad.UsuarioAct = request.UsuarioAct;
            comunidad.FechaAct = request.FechaAct;

            // Guardado en bitacora
            var bitacora = new BitacoraDomain(
                0,
                "Comunidad",
                comunidad.ComunidadId,
                "Actualizar",
                $"Actualización de comunidad {comunidad.NombreComunidad}",
                DateTime.Now,
                request.UsuarioLogeado
                );
            await _repositoryBitacora.Create(bitacora);

            //  Actualizar entidad
            await _repository.Update(comunidad);

            //  Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            //  Retornar resultado
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
