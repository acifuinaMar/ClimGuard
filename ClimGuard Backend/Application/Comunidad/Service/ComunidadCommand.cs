using MediatR;

namespace Application.Comunidad.Service
{
    public record CreateComunidadCommand(
        int ComunidadId,
        string NombreComunidad,
        string? Descripcion,
        string Pais,
        string Departamento,
        string Municipio,
        decimal Latitud,
        decimal Longitud,
        bool Activo,
        int UsuarioIng,
        DateTime FechaIng,
        int? UsuarioAct,
        DateTime? FechaAct,
        int UsuarioLogeado
    ) : IRequest<ComunidadResultDto>;


    public record UpdateComunidadCommand(
        int ComunidadId,
        string NombreComunidad,
        string? Descripcion,
        string Pais,
        string Departamento,
        string Municipio,
        decimal Latitud,
        decimal Longitud,
        bool Activo,
        int UsuarioIng,
        DateTime FechaIng,
        int? UsuarioAct,
        DateTime? FechaAct,
        int UsuarioLogeado
    ) : IRequest<ComunidadResultDto>;


    public record DeleteComunidadCommand(
        int ComunidadId,
        int UsuarioLogeado
    ) : IRequest<bool>;
}
