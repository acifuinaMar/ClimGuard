using MediatR;
using Services.Services.Interfaces;

namespace Application.NivelAlerta.Service.Queries
{
    public sealed class NivelAlertaGetAllHandler : IRequestHandler<NivelAlertaGetAllQuery, IReadOnlyList<NivelAlertaResultDto>>
    {
        private readonly INivelAlerta _repository;

        public NivelAlertaGetAllHandler(INivelAlerta repository)
        {
            _repository = repository;
        }
        public async Task<IReadOnlyList<NivelAlertaResultDto>> Handle(NivelAlertaGetAllQuery request, CancellationToken cancellationToken)
        {
            var nivel = await _repository.GetAll();

            return nivel.Select(a => new NivelAlertaResultDto
            (
                a.NivelAlertaId,
                a.Nombre,
                a.ColorHex,
                a.Activo,
                a.UsuarioIng,
                a.FechaIng,
                a.UsuarioAct,
                a.FechaAct
            )).ToList();
        }
    }
}
