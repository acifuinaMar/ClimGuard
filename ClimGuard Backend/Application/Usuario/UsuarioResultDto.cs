namespace Application.Usuario
{
    public record UsuarioResultDto(
        int UsuarioId,
        string NombreCompleto,
        string NombreUsuario,
        DateTime? UltimoAcceso,
        bool Activo,
        int RolId,
        int UsuarioIng,
        DateTime FechaIng,
        int? UsuarioAct,
        DateTime? FechaAct
    );
}