using Domain.Bitacora;
using Domain.Interfaces;
using MediatR;
using tickets.Application.Common.UnitOfWork;

namespace Application.Bitacora.Sevice.Command
{
    public sealed class BitacoraCreateCommandHandler : IRequestHandler<BitacoraCommand, bool>
    {
        private readonly IBitacora _repository;
        private readonly IUnitOfWork _unitOfWork;

        public BitacoraCreateCommandHandler(IBitacora repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }

        public async Task<bool> Handle(BitacoraCommand request, CancellationToken cancellationToken)
        {
            var bitacora = new BitacoraDomain(
                0, 
                request.usuarioId, 
                request.accion, 
                request.fechaRegistro
            );
            await _repository.Create(bitacora);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return true;
        }
    }
}
