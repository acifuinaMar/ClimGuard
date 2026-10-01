using Domain.Bitacora;
using Domain.Entities.PhenomenonType;
using Domain.Interfaces;
using MediatR;
using tickets.Application.Common.UnitOfWork;

namespace Application.TipoFenomeno.Service.Commands
{
    public sealed class CreateTipoFenomenoCommandHandler : IRequestHandler<CreateTipoFenomenoCommand, TipoFenomenoResultDto>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ITipoFenomeno _repositoryTipoFenomeno;
        private readonly IBitacora _repositoryBitacora;

        public CreateTipoFenomenoCommandHandler(IUnitOfWork unitOfWork, ITipoFenomeno repositoryTipoFenomeno, IBitacora repositoryBitacora)
        {
            _unitOfWork = unitOfWork;
            _repositoryTipoFenomeno = repositoryTipoFenomeno;
            _repositoryBitacora = repositoryBitacora;
        }

        public async Task<TipoFenomenoResultDto> Handle(CreateTipoFenomenoCommand request, CancellationToken cancellationToken)
        {
            var tipoFenomeno = new TipoFenomenoDomain(
                0,
                request.Nombre,
                request.Activo,
                request.UsuarioIng,
                request.FechaIng,
                request.UsuarioAct,
                request.FechaAct
            );

            var bitacora = new BitacoraDomain(
                0,
                "TipoFenomeno",
                tipoFenomeno.TipoFenomenoId,
                "Crear",
                $"Creación de tipo de fenómeno {tipoFenomeno.Nombre}",
                DateTime.Now,
                request.UsuarioLogeado
            );

            await _repositoryTipoFenomeno.Create(tipoFenomeno);
            await _repositoryBitacora.Create(bitacora);
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
