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
