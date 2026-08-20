using MediatR;
using Services.Services.Interfaces;

namespace Application.LecturaSensor.Service.Queries
{
    public sealed class LecturaSensorGetByDateHandler : IRequestHandler<LecturaSensorGetByDateRangeQuery, IReadOnlyList<LecturaSensorResultDto>>
    {
        private readonly ILecturaSensor _repository;
        public LecturaSensorGetByDateHandler(ILecturaSensor repository)
        {
            _repository = repository;
        }
        public async Task<IReadOnlyList<LecturaSensorResultDto>> Handle(LecturaSensorGetByDateRangeQuery request, CancellationToken cancellationToken)
        {
            // CORRECCIÓN 1: Usar el método correcto (GetBySensorAndDateRange, no GetById)
            var lecturas = await _repository.GetBySensorAndDateRange(
                request.SensorId,
                request.Desde,
                request.Hasta
            );

            // CORRECCIÓN 2: Mapear la lista completa, no un solo elemento
            return lecturas.Select(l => new LecturaSensorResultDto
            (
                l.LecturaId,
                l.SensorId,
                l.Valor,
                l.FechaHora
            )).ToList();
        }
    }
}
