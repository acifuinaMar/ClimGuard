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
                request.valorDetectado,
                request.mensajeSnap,
                request.nivelAlertaIdSnap,
                request.tipoFenomenoIdSnap,
                request.fechaHora,
                request.activo,
                request.sensorId,
                request.comunidadId,
                request.reglaAlertaId,
                request.estadoAlertaId,
                request.usuarioResponsableId,
                request.usuarioIng,
                request.fechaIng,
                request.usuarioAct,
                request.fechaAct
            );
            /*
            var bitacora = new BitacoraDomain(
                0,
                "Alerta",
                Alerta.AlertaId,
                "Eliminar",
                $"Creación de la alerta {Alerta.Nombre}",
                DateTime.Now,
                request.UsuarioLogeado
            );
            await _repositoryBitacora.Create(bitacora);*/
            await _repository.Create(alerta);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

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
