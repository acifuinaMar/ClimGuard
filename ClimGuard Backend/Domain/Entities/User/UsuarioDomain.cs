namespace Domain.Entities.User;

public partial class UsuarioDomain
{
    public UsuarioDomain(int usuarioId, string apellido2, string apellido1, string nombre2, string nombre1, string nombreUsuario, string passwordHash, string rol, bool activo, DateTime fechaRegistro)
    {
        UsuarioId = usuarioId;
        Apellido2 = apellido2;
        Apellido1 = apellido1;
        Nombre2 = nombre2;
        Nombre1 = nombre1;
        NombreUsuario = nombreUsuario;
        PasswordHash = passwordHash;
        Rol = rol;
        Activo = activo;
        FechaRegistro = fechaRegistro;
    }

    public int UsuarioId { get; set; }

    public string Apellido2 { get; set; } = null!;

    public string Apellido1 { get; set; } = null!;

    public string Nombre2 { get; set; } = null!;

    public string Nombre1 { get; set; } = null!;

    public string NombreUsuario { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Rol { get; set; } = null!;

    public bool Activo { get; set; }

    public DateTime FechaRegistro { get; set; }
}
