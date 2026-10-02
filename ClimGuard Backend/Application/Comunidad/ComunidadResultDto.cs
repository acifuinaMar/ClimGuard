namespace Application.Comunidad
{
    public record ComunidadResultDto(
        int ComunidadId,
        string Nombre,
        decimal Latitud,
        decimal Longitud,
        string Descripcion,
        DateOnly? FechaRegistro
        );
}
