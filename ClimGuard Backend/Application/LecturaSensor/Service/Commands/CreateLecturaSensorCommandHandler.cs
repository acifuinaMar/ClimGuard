using Domain.Entities.SensorReading;
using MediatR;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Application.LecturaSensor.Service.Commands
{
    public sealed class CreateLecturaSensorCommandHandler : IRequestHandler<CreateLecturaSensorCommand, LecturaSensorResultDto>
    {
        private readonly ILecturaSensor _repository;
        private readonly IUnitOfWork _unitOfWork;

        public CreateLecturaSensorCommandHandler(ILecturaSensor repository, IUnitOfWork unitOfWork)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
        }
        public async Task<LecturaSensorResultDto> Handle(CreateLecturaSensorCommand request, CancellationToken cancellationToken)
        {
            var obj = new LecturaSensorDomain(
                0,
                request.sensorId,
                request.valor,
                request.fechaHora
            );
            await _repository.Create(obj);
            await _unitOfWork.SaveChangeAsync(cancellationToken);

            return new LecturaSensorResultDto(
                obj.LecturaId,
                obj.SensorId,
                obj.Valor,
                obj.FechaHora
                );
        }
    }
}
