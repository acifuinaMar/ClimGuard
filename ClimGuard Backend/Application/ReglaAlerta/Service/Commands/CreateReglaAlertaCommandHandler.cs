using Domain.Bitacora;
using Domain.Entities.ReglaAlerta;
using Domain.Interfaces;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Application.ReglaAlerta.Service.Commands
{
    public sealed class CreateReglaAlertaCommandHandler : IRequestHandler<CreateReglaAlertaCommand, ReglaAlertaResultDto>
    {
        private readonly IReglaAlerta _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;

        public CreateReglaAlertaCommandHandler(IReglaAlerta repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
        }

        public async Task<ReglaAlertaResultDto> Handle(CreateReglaAlertaCommand request, CancellationToken cancellationToken)
        {
            var reglaAlerta = new ReglaAlertaDomain(
                0,
                request.nombre,
                request.valorMin,
                request.valorMax,
                request.mensaje,
                request.activo,
                request.tipoSensorId,
                request.tipoFenomenoId,
                request.nivelAlertaId,
                request.usuarioIng,
                request.fechaIng,
                request.usuarioAct,
                request.fechaAct
            );

            var bitacora = new BitacoraDomain(
                0,
                "Comunidad",
                reglaAlerta.ReglaAlertaId,
                "Actualizar",
                $"Creación de regla de alerta {reglaAlerta.Nombre}",
                DateTime.Now,
                request.usuarioLogeado
                );

            await _repository.Create(reglaAlerta);
            await _repositoryBitacora.Create(bitacora);
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
