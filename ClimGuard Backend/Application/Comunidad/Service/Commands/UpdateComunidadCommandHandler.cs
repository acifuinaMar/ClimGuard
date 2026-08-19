using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Comunidad.Service.Commands
{
    public sealed class UpdateComunidadCommandHandler : IRequestHandler<UpdateComunidadCommand, ComunidadResultDto>
    {
        private readonly IComunidad _repository;
        private readonly IUnitOfWork _unitOfWork;

        public UpdateComunidadCommandHandler(IComunidad repository,IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<ComunidadResultDto> Handle(UpdateComunidadCommand request,CancellationToken cancellationToken)
        {
            // 1. Buscar la comunidad
            var comunidad = await _repository.GetById(request.ComunidadId);

            if (comunidad == null)
            {
                throw new KeyNotFoundException(
                    $"No se encontró la comunidad con ID {request.ComunidadId}");
            }

            // 2. Actualizar propiedades
            comunidad.ComunidadId = request.ComunidadId;
            comunidad.Nombre = request.Nombre;
            comunidad.Latitud = request.Latitud;
            comunidad.Longitud = request.Longitud;
            comunidad.Descripcion = request.Descripcion;
            comunidad.FechaRegistro = request.FechaRegistro;


            // 3. Actualizar entidad
            await _repository.Update(comunidad);

            // 4. Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            // 5. Retornar resultado
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
