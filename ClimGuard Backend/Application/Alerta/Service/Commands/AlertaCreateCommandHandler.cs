using Domain.Bitacora;
using Domain.Entities.Alert;
using Domain.Interfaces;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Alerta.Service.Commands
{
    public sealed class AlertaCreateCommandHandler : IRequestHandler<AlertCreateCommand, AlertaResultDto>
    {
        private readonly IAlerta _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;

        public AlertaCreateCommandHandler(IAlerta repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
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

            var bitacora = new BitacoraDomain(
                0,
                request.UsuarioLogeado,
                $"Registro de nueva alerta ",
                DateTime.Now
                );
            await _repositoryBitacora.Create(bitacora);
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
