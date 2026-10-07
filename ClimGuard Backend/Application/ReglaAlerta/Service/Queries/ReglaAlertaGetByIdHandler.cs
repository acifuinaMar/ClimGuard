using Domain.Interfaces;
using MediatR;

namespace Application.ReglaAlerta.Service.Queries
{
    public sealed class ReglaAlertaGetByIdHandler : IRequestHandler<ReglaAlertaGetByIdQuery, ReglaAlertaResultDto>
    {
        private readonly IReglaAlerta _repository;
        public ReglaAlertaGetByIdHandler(IReglaAlerta repository)
        {
            _repository = repository;
        }
        public async Task<ReglaAlertaResultDto> Handle(ReglaAlertaGetByIdQuery request, CancellationToken cancellationToken)
        {
            var regla = await _repository.GetById(request.id);

            if (regla == null)
                return null;

            return new ReglaAlertaResultDto(
                regla.ReglaAlertaId,
                regla.Nombre,
                regla.ValorMin,
                regla.ValorMax,
                regla.Mensaje,
                regla.Activo,
                regla.TipoSensorId,
                regla.TipoFenomenoId,
                regla.NivelAlertaId,
                regla.UsuarioIng,
                regla.FechaIng,
                regla.UsuarioAct,
                regla.FechaAct
            );
        }
    }
}
