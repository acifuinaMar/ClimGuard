using Application.Comunidad;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Alerta.Service.Commands
{
    public sealed class AlertaUpdateCommandHandler : IRequestHandler<AlertUpdateCommand, AlertaResultDto>
    {
        private readonly IAlerta _repository;
        private readonly IUnitOfWork _unitOfWork;

        public AlertaUpdateCommandHandler(IAlerta repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<AlertaResultDto> Handle(AlertUpdateCommand request, CancellationToken cancellationToken)
        {
            // 1. Buscar la alerta
            var alerta = await _repository.GetById(request.alertaId);

            if (alerta == null)
            {
                throw new KeyNotFoundException(
                    $"No se encontró la alerta con ID {request.alertaId}");
            }

            // 2. Actualizar propiedades
            alerta.AlertaId = request.alertaId;
            alerta.ComunidadId = request.comunidadId;
            alerta.SensorId = request.sensorId;
            alerta.TipoFenomenoId = request.tipoFenomenoId;
            alerta.NivelAlertaId = request.nivelAlertaId;
            alerta.Mensaje = request.mensaje;
            alerta.FechaHora = request.fechaHora;
            alerta.Activa = request.activa;
            alerta.FechaResolucion = request.fechaResolucion;

            // 3. Actualizar entidad
            await _repository.Update(alerta);

            // 4. Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            // 5. Retornar resultado
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
