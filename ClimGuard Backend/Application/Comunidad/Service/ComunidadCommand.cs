using MediatR;

namespace Application.Comunidad.Service
{
    public record CreateComunidadCommand(
        int ComunidadId,
        string Nombre,
        decimal Latitud,
        decimal Longitud,
        string Descripcion,
        DateOnly FechaRegistro
    ) : IRequest<ComunidadResultDto>;


    public record UpdateComunidadCommand(
        int ComunidadId,
        string Nombre,
        decimal Latitud,
        decimal Longitud,
        string Descripcion,
        DateOnly FechaRegistro
    ) : IRequest<ComunidadResultDto>;


    public record DeleteComunidadCommand(
        int ComunidadId
    ) : IRequest<bool>;
}
