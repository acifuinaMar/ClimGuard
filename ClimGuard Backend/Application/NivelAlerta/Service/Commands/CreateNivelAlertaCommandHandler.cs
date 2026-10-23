using Domain.Bitacora;
using Domain.Entities.AlertLevel;
using Domain.Interfaces;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.NivelAlerta.Service.Commands
{
    public sealed class CreateNivelAlertaCommandHandler : IRequestHandler<CreateNivelAlertaCommand, NivelAlertaResultDto>
    {
        private readonly INivelAlerta _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;

        public CreateNivelAlertaCommandHandler(INivelAlerta repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
        }

        public async Task<NivelAlertaResultDto> Handle(CreateNivelAlertaCommand request, CancellationToken cancellationToken)
        {
            var nivelAlerta = new NivelAlertaDomain(
                0,
                request.nombre,
                request.colorHex,
                request.activo,
                request.usuarioIng,
                request.fechaIng,
                request.usuarioAct,
                request.fechaAct
            );

            var bitacora = new BitacoraDomain(
                0,
                "NivelAlerta",
                nivelAlerta.NivelAlertaId,
                "Crear",
                $"Creación de nivel de alerta {nivelAlerta.Nombre}",
                DateTime.Now,
                request.usuarioLogeado
                ); 

            await _repository.Create(nivelAlerta);
            await _repositoryBitacora.Create(bitacora);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return new NivelAlertaResultDto(
                nivelAlerta.NivelAlertaId,
                nivelAlerta.Nombre,
                nivelAlerta.ColorHex,
                nivelAlerta.Activo,
                nivelAlerta.UsuarioIng,
                nivelAlerta.FechaIng,
                nivelAlerta.UsuarioAct,
                nivelAlerta.FechaAct
            );
        }
    }
}
