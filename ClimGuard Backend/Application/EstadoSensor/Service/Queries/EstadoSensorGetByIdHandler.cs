using MediatR;
using Domain.Interfaces;

namespace Application.EstadoSensor.Service.Queries
{
    public sealed class EstadoSensorGetByIdHandler
        : IRequestHandler<EstadoSensorGetByIdQuery, EstadoSensorResultDto>
    {
        private readonly IEstadoSensor _repository;

        public EstadoSensorGetByIdHandler(IEstadoSensor repository)
        {
            _repository = repository;
        }

        public async Task<EstadoSensorResultDto> Handle(
            EstadoSensorGetByIdQuery request,
            CancellationToken cancellationToken)
        {
            var estado = await _repository.GetById(request.id);

            return new EstadoSensorResultDto
            (
                estado.EstadoSensorId,
                estado.Nombre,
                estado.Activo
            );
        }
    }
}