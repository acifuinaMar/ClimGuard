namespace Application.Comunidad
{
    public record ComunidadResultDto(
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
        DateTime? FechaAct
    );
}