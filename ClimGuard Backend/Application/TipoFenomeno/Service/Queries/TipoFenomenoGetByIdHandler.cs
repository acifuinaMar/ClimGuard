using Domain.Interfaces;
using MediatR;

namespace Application.TipoFenomeno.Service.Queries
{
    public sealed class TipoFenomenoGetByIdHandler : IRequestHandler<TipoFenomenoGetByIdQuery, TipoFenomenoResultDto>
    {
        private readonly ITipoFenomeno _repository;

        public TipoFenomenoGetByIdHandler(ITipoFenomeno repository)
        {
            _repository = repository;
        }

        public async Task<TipoFenomenoResultDto> Handle(TipoFenomenoGetByIdQuery request, CancellationToken cancellationToken)
        {
            var tipo = await _repository.GetById(request.id);

            if(tipo == null)
                return null;

            return new TipoFenomenoResultDto(
                tipo.TipoFenomenoId,
                tipo.Nombre,
                tipo.Activo,
                tipo.UsuarioIng,
                tipo.FechaIng,
                tipo.UsuarioAct,
                tipo.FechaAct
            );
        }
    }
}
