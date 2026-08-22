using Domain.Interfaces;
using MediatR;

namespace Application.Bitacora.Sevice.Query
{
    public sealed class BitacoraGetAllHandler : IRequestHandler<BitacoraGetAllQuery, IReadOnlyList<BitacoraResultDto>>
    {
        private readonly IBitacora _repository;
        public BitacoraGetAllHandler(IBitacora repository)
        {
            _repository = repository;
        }
        public async Task<IReadOnlyList<BitacoraResultDto>> Handle(BitacoraGetAllQuery request, CancellationToken cancellationToken)
        {
            var list = await _repository.GetAll();

            return list.Select(a => new BitacoraResultDto
            (
                a.BitacoraId,
                a.UsuarioId,
                a.Accion,
                a.FechaRegistro
            )).ToList();
        }
    }
}
