namespace Application.TipoFenomeno
{
    public record TipoFenomenoResultDto(
        int TipoFenomenoId, 
        string Nombre, 
        bool Activo, 
        int UsuarioIng, 
        DateTime FechaIng, 
        int? UsuarioAct, 
        DateTime? FechaAct
        );
}
