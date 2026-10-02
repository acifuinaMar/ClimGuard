using MediatR;
using Services.Services.Interfaces;

namespace Application.Alerta.Service.Queries
{
    public sealed class AlertaGetByIdHandler : IRequestHandler<AlertaGetByIdQuery, AlertaResultDto>
    {
        private readonly IAlerta _repository;
        public AlertaGetByIdHandler(IAlerta repository)
        {
            _repository = repository;
        }
        public async Task<AlertaResultDto> Handle(AlertaGetByIdQuery request, CancellationToken cancellationToken)
        {
            var alerta = await _repository.GetById(request.id);

            return new AlertaResultDto(
                alerta.AlertaId,
                alerta.ComunidadId,
                alerta.SensorId,
                alerta.TipoFenomenoId,
                alerta.NivelAlertaId,
                alerta.Mensaje,
                alerta.FechaHora,
                alerta.Activa,
                alerta.FechaResolucion
                );
        }
    }
}
