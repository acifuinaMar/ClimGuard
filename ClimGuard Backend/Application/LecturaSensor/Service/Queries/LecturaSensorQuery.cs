using MediatR;

namespace Application.LecturaSensor.Service.Queries
{
    // Query para obtener todas las lecturas
    public record LecturaSensorGetAllQuery() : IRequest<IReadOnlyList<LecturaSensorResultDto>>;

    // Query para obtener lecturas por sensor y rango de fechas
    public record LecturaSensorGetByDateRangeQuery(
        int SensorId,
        DateTime Desde,
        DateTime Hasta
    ) : IRequest<IReadOnlyList<LecturaSensorResultDto>>; // Retorna una lista

    // Query para obtener lecturas por sensor y rango de fechas
    public record LecturaSensorGetByIdQuery(
        int SensorId
    ) : IRequest<IReadOnlyList<LecturaSensorResultDto>>; // Retorna una lista
}
