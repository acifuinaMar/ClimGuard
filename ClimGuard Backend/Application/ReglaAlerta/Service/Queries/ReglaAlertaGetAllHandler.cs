using Domain.Interfaces;
using MediatR;

namespace Application.ReglaAlerta.Service.Queries
{
    public sealed class ReglaAlertaGetAllHandler : IRequestHandler<ReglaAlertaGetAllQuery, IReadOnlyList<ReglaAlertaResultDto>>
    {
        private readonly IReglaAlerta _repository;
        public ReglaAlertaGetAllHandler(IReglaAlerta repository)
        {
            _repository = repository;
        }
        public async Task<IReadOnlyList<ReglaAlertaResultDto>> Handle(ReglaAlertaGetAllQuery request, CancellationToken cancellationToken)
        {
            var reglas = await _repository.GetAll();
            return reglas.Select(a => new ReglaAlertaResultDto
            (
                a.ReglaAlertaId,
                a.Nombre,
                a.ValorMin,
                a.ValorMax,
                a.Mensaje,
                a.Activo,
                a.TipoSensorId,
                a.TipoFenomenoId,
                a.NivelAlertaId,
                a.UsuarioIng,
                a.FechaIng,
                a.UsuarioAct,
                a.FechaAct
            )).ToList();
        }
    }
}
