using Domain.Bitacora;
using Domain.Interfaces;
using MediatR;
using tickets.Application.Common.UnitOfWork;

namespace Application.TipoFenomeno.Service.Commands
{
    public sealed class UpdateTipoFenomenoCommandHandler : IRequestHandler<UpdateTipoFenomenoCommand, TipoFenomenoResultDto>
    {
        private readonly ITipoFenomeno _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IBitacora _repositoryBitacora;

        public UpdateTipoFenomenoCommandHandler(ITipoFenomeno repository, IUnitOfWork unitOfWork, IBitacora repositoryBitacora)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _repositoryBitacora = repositoryBitacora;
        }

        public async Task<TipoFenomenoResultDto> Handle(UpdateTipoFenomenoCommand request, CancellationToken cancellationToken)
        {
            var tipoFenomeno = await _repository.GetById(request.TipoFenomenoId);

            if (tipoFenomeno == null)
            {
                throw new KeyNotFoundException($"No se encontró el tipo de fenómeno con ID {request.TipoFenomenoId}");
            }

            tipoFenomeno.Nombre = request.Nombre;
            tipoFenomeno.Activo = request.Activo;
            tipoFenomeno.UsuarioIng = request.UsuarioIng;
            tipoFenomeno.FechaIng = request.FechaIng;
            tipoFenomeno.UsuarioAct = request.UsuarioAct;
            tipoFenomeno.FechaAct = request.FechaAct;

            var bitacora = new BitacoraDomain(
                0,
                "TipoFenomeno",
                tipoFenomeno.TipoFenomenoId,
                "Actualizar",
                $"Actualización de tipo de fenómeno {tipoFenomeno.Nombre}",
                DateTime.Now,
                request.UsuarioLogeado
            );

            await _repositoryBitacora.Create(bitacora);
            await _repository.Update(tipoFenomeno);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return new TipoFenomenoResultDto(
                tipoFenomeno.TipoFenomenoId,
                tipoFenomeno.Nombre,
                tipoFenomeno.Activo,
                tipoFenomeno.UsuarioIng,
                tipoFenomeno.FechaIng,
                tipoFenomeno.UsuarioAct,
                tipoFenomeno.FechaAct
            );
        }
    }
}
