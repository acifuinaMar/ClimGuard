using MediatR;
using Services.Services.Interfaces;

namespace Application.Comunidad.Service.Queries
{
    public sealed class ComunidadGetAllHandler : IRequestHandler<ComunidadGetAllQuery, IReadOnlyList<ComunidadResultDto>>
    {
        public readonly IComunidad _repository;

        public ComunidadGetAllHandler(IComunidad repository)
        {
            _repository = repository;
        }

        public async Task<IReadOnlyList<ComunidadResultDto>> Handle(ComunidadGetAllQuery request, CancellationToken cancellationToken)
        {
            var comunidades = await _repository.GetAll();

            return comunidades.Select(a => new ComunidadResultDto
            (
                a.ComunidadId,
                a.Nombre,
                a.Latitud,
                a.Longitud,
                a.Descripcion,
                a.FechaRegistro
            )).ToList();
        }
    }
}
