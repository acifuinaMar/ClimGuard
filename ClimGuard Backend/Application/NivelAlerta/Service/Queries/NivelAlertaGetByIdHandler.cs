using MediatR;
using Services.Services.Interfaces;

namespace Application.NivelAlerta.Service.Queries
{
    public sealed class NivelAlertaGetByIdHandler : IRequestHandler<NivelAlertaGetByIdQuery, NivelAlertaResultDto>
    {
        private readonly INivelAlerta _repository;

        public NivelAlertaGetByIdHandler(INivelAlerta repository)
        {
            _repository = repository;
        }
        public async Task<NivelAlertaResultDto> Handle(NivelAlertaGetByIdQuery request, CancellationToken cancellationToken)
        {
            var nivel = await _repository.GetById(request.id);

            return new NivelAlertaResultDto(
                nivel.NivelAlertaId,
                nivel.Nombre,
                nivel.ColorHex,
                nivel.Activo,
                nivel.UsuarioIng,
                nivel.FechaIng,
                nivel.UsuarioAct,
                nivel.FechaAct
            );
        }
    }

}
