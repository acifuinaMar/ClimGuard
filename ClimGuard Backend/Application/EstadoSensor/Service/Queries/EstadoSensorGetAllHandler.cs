using MediatR;
using Domain.Interfaces;

namespace Application.EstadoSensor.Service.Queries
{
    public sealed class EstadoSensorGetAllHandler
        : IRequestHandler<EstadoSensorGetAllQuery, IReadOnlyList<EstadoSensorResultDto>>
    {
        private readonly IEstadoSensor _repository;

        public EstadoSensorGetAllHandler(IEstadoSensor repository)
        {
            _repository = repository;
        }

        public async Task<IReadOnlyList<EstadoSensorResultDto>> Handle(
            EstadoSensorGetAllQuery request,
            CancellationToken cancellationToken)
        {
            var estados = await _repository.GetAll();

            return estados.Select(a => new EstadoSensorResultDto
            (
                a.EstadoSensorId,
                a.Nombre,
                a.Activo
            )).ToList();
        }
    }
}