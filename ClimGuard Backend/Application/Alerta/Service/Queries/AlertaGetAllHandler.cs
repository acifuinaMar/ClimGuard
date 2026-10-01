using MediatR;
using Services.Services.Interfaces;

namespace Application.Alerta.Service.Queries
{
    public sealed class AlertaGetAllHandler : IRequestHandler<AlertaGetAllQuery, IReadOnlyList<AlertaResultDto>>
    {
        private readonly IAlerta _repository;
        public AlertaGetAllHandler(IAlerta repository)
        {
            _repository = repository;
        }
        public async Task<IReadOnlyList<AlertaResultDto>> Handle(AlertaGetAllQuery request, CancellationToken cancellationToken)
        {
            var alertas = await _repository.GetAll();

            return alertas.Select(a => new AlertaResultDto
            (
                a.AlertaId,
                a.ValorDetectado,
                a.MensajeSnap,
                a.NivelAlertaIdSnap,
                a.TipoFenomenoIdSnap,
                a.FechaHora,
                a.Activo,
                a.SensorId,
                a.ComunidadId,
                a.ReglaAlertaId,
                a.EstadoAlertaId,
                a.UsuarioResponsable
            )).ToList();
        }
    }
}
