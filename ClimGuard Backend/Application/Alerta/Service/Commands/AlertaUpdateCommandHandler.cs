using Application.Comunidad;
using Domain.Bitacora;
using Domain.Interfaces;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.Alerta.Service.Commands
{
    public sealed class AlertaUpdateCommandHandler : IRequestHandler<AlertUpdateCommand, AlertaResultDto>
    {
        private readonly IAlerta _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;

        public AlertaUpdateCommandHandler(IAlerta repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
        }
        public async Task<AlertaResultDto> Handle(AlertUpdateCommand request, CancellationToken cancellationToken)
        {
            // Buscar la alerta
            var alerta = await _repository.GetById(request.alertaId);

            if (alerta == null)
            {
                throw new KeyNotFoundException(
                    $"No se encontró la alerta con ID {request.alertaId}");
            }

            //  Actualizar propiedades
            alerta.AlertaId = request.alertaId;
            alerta.ComunidadId = request.comunidadId;
            alerta.SensorId = request.sensorId;
            alerta.TipoFenomenoId = request.tipoFenomenoId;
            alerta.NivelAlertaId = request.nivelAlertaId;
            alerta.Mensaje = request.mensaje;
            alerta.FechaHora = request.fechaHora;
            alerta.Activa = request.activa;
            alerta.FechaResolucion = request.fechaResolucion;

            //Guardado de bitacora
            var bitacora = new BitacoraDomain(
                0,
                request.UsuarioLogeado,
                $"Actualizacion de alerta {request.alertaId}",
                DateTime.Now
                );
            await _repositoryBitacora.Create(bitacora);

            //  Actualizar entidad
            await _repository.Update(alerta);

            // Guardar cambios
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            // Retornar resultado
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
