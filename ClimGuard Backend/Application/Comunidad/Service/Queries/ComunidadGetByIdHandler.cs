using MediatR;
using Services.Services.Interfaces;

namespace Application.Comunidad.Service.Queries
{
    public sealed class ComunidadGetByIdHandler : IRequestHandler<ComunidadGetByIdQuery, ComunidadResultDto>
    {
        private readonly IComunidad _repository;
        public ComunidadGetByIdHandler(IComunidad repository)
        {
            _repository = repository;
        }

        public async Task<ComunidadResultDto> Handle(ComunidadGetByIdQuery request, CancellationToken cancellationToken)
        {
            var comunidad = await _repository.GetById(request.id);

            if (comunidad == null)
                return null;

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
