using Domain.Entities.Alert;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Alerta.Service.Commands
{
    public sealed class AlertaCreateCommandHandler : IRequestHandler<AlertCreateCommand, AlertaResultDto>
    {
        private readonly IAlerta _repository;
        private readonly IUnitOfWork _unitOfWork;

        public AlertaCreateCommandHandler(IAlerta repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<AlertaResultDto> Handle(AlertCreateCommand request, CancellationToken cancellationToken)
        {
            var alerta = new AlertaDomain(
                0,
                request.comunidadId,
                request.sensorId,
                request.tipoFenomenoId,
                request.nivelAlertaId,
                request.mensaje,
                request.fechaHora,
                request.activa,
                request.fechaResolucion
            );
            await _repository.Create(alerta);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

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
