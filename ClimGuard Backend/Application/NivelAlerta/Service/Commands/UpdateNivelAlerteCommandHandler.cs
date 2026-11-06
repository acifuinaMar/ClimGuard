using Application.Comunidad;
using Application.Comunidad.Service;
using Domain.Bitacora;
using Domain.Interfaces;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.NivelAlerta.Service.Commands
{
    public sealed class UpdateNivelAlerteCommandHandler : IRequestHandler<UpdateNivelAlertaCommand, NivelAlertaResultDto>
    {
        private readonly INivelAlerta _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;

        public UpdateNivelAlerteCommandHandler(INivelAlerta repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
        }

        public async Task<NivelAlertaResultDto> Handle(UpdateNivelAlertaCommand request, CancellationToken cancellationToken)
        {
            var nivelAlerta = await _repository.GetById(request.nivelAlertaId);

            if (nivelAlerta == null)
            {
                throw new InvalidOperationException("Nivel de alerta no encontrado");
            }

            // Actualizar las propiedades del nivel de alerta
            nivelAlerta.NivelAlertaId = request.nivelAlertaId;
            nivelAlerta.Nombre = request.nombre;
            nivelAlerta.ColorHex = request.colorHex;
            nivelAlerta.Activo = request.activo;
            nivelAlerta.UsuarioIng = request.usuarioIng;
            nivelAlerta.FechaIng = request.fechaIng;    
            nivelAlerta.UsuarioAct = request.usuarioAct;
            nivelAlerta.FechaAct = request.fechaAct;

            var bitacora = new BitacoraDomain(
                0,
                "NivelAlerta",
                nivelAlerta.NivelAlertaId,
                "Actualizar",
                $"Actualización de nivel de alerta {nivelAlerta.Nombre}",
                DateTime.Now,
                request.usuarioLogeado
            );

            await _repository.Update(nivelAlerta);
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
