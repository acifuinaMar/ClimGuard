using Domain.Interfaces;
using MediatR;

namespace Application.TipoFenomeno.Service.Queries
{
    public sealed class TipoFenomenoGetAllHandler : IRequestHandler<TipoFenomenoGetAllQuery, IReadOnlyList<TipoFenomenoResultDto>>
    {
        private readonly ITipoFenomeno _repository;
        public TipoFenomenoGetAllHandler(ITipoFenomeno repository)
        {
            _repository = repository;
        }
        public async Task<IReadOnlyList<TipoFenomenoResultDto>> Handle(TipoFenomenoGetAllQuery request, CancellationToken cancellationToken)
        {
            var tipoFenomenos = await _repository.GetAll();
            return tipoFenomenos.Select(tipoFenomeno => new TipoFenomenoResultDto(
                tipoFenomeno.TipoFenomenoId,
                tipoFenomeno.Nombre,
                tipoFenomeno.Activo,
                tipoFenomeno.UsuarioIng,
                tipoFenomeno.FechaIng,
                tipoFenomeno.UsuarioAct,
                tipoFenomeno.FechaAct
                )).ToList();
        }
    }
}
