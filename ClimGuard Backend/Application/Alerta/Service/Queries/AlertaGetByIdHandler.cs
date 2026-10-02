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
                alerta.ValorDetectado,
                alerta.MensajeSnap,
                alerta.NivelAlertaIdSnap,
                alerta.TipoFenomenoIdSnap,
                alerta.FechaHora,
                alerta.Activo,
                alerta.SensorId,
                alerta.ComunidadId,
                alerta.ReglaAlertaId,
                alerta.EstadoAlertaId,
                alerta.UsuarioResponsableId,
                alerta.UsuarioIng,
                alerta.FechaIng,
                alerta.UsuarioAct,
                alerta.FechaAct
            );
        }
    }
}
