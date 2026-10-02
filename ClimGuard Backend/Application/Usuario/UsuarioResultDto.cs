namespace Application.Usuario
{
    public record UsuarioResultDto(
        int UsuarioId,
        string Apellido2,
        string Apellido1,
        string Nombre2,
        string Nombre1,
        string NombreUsuario,
        string Rol,
        bool Activo,
        DateTime FechaRegistro
        );
}
