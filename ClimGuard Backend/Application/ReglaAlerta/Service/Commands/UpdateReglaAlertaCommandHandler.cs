using Domain.Bitacora;
using Domain.Interfaces;
using MediatR;
using tickets.Application.Common.UnitOfWork;

namespace Application.ReglaAlerta.Service.Commands
{
    public sealed class UpdateReglaAlertaCommandHandler : IRequestHandler<UpdateReglaAlertaCommand, ReglaAlertaResultDto>
    {
        private readonly IReglaAlerta _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;

        public UpdateReglaAlertaCommandHandler(IReglaAlerta repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
        }

        public async Task<ReglaAlertaResultDto> Handle(UpdateReglaAlertaCommand request, CancellationToken cancellationToken)
        {
            var reglaAlerta = await _repository.GetById(request.reglaAlertaId);

            if (reglaAlerta == null)
            {
                throw new KeyNotFoundException(
                    $"No se encontró la regla de alerta con ID {request.reglaAlertaId}");
            }

            reglaAlerta.ReglaAlertaId = request.reglaAlertaId;
            reglaAlerta.Nombre = request.nombre;
            reglaAlerta.ValorMin = request.valorMin;
            reglaAlerta.ValorMax = request.valorMax;
            reglaAlerta.Mensaje = request.mensaje;
            reglaAlerta.Activo = request.activo;
            reglaAlerta.TipoSensorId = request.tipoSensorId;
            reglaAlerta.TipoFenomenoId = request.tipoFenomenoId;
            reglaAlerta.NivelAlertaId = request.nivelAlertaId;
            reglaAlerta.UsuarioIng = request.usuarioIng;
            reglaAlerta.FechaIng = request.fechaIng;
            reglaAlerta.UsuarioAct = request.usuarioAct;
            reglaAlerta.FechaAct = request.fechaAct;

            var bitacora = new BitacoraDomain(
                0,
                "ReglaAlerta",
                reglaAlerta.ReglaAlertaId,
                "Actualizar",
                $"Actualización de regla de alerta {reglaAlerta.Nombre}",
                DateTime.Now,
                request.usuarioLogeado
            );

            await _repositoryBitacora.Create(bitacora);
            await _repository.Update(reglaAlerta);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return new ReglaAlertaResultDto(
                reglaAlerta.ReglaAlertaId,
                reglaAlerta.Nombre,
                reglaAlerta.ValorMin,
                reglaAlerta.ValorMax,
                reglaAlerta.Mensaje,
                reglaAlerta.Activo,
                reglaAlerta.TipoSensorId,
                reglaAlerta.TipoFenomenoId,
                reglaAlerta.NivelAlertaId,
                reglaAlerta.UsuarioIng,
                reglaAlerta.FechaIng,
                reglaAlerta.UsuarioAct,
                reglaAlerta.FechaAct
            );  
        }
    }
}
