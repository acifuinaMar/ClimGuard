namespace Domain.Entities.User;

public partial class UsuarioDomain
{
    public UsuarioDomain(
        int usuarioId,
        string nombreCompleto,
        string nombreUsuario,
        string passwordHash,
        DateTime? ultimoAcceso,
        bool activo,
        int rolId,
        int usuarioIng,
        DateTime fechaIng,
        int? usuarioAct,
        DateTime? fechaAct)
    {
        UsuarioId = usuarioId;
        NombreCompleto = nombreCompleto;
        NombreUsuario = nombreUsuario;
        PasswordHash = passwordHash;
        UltimoAcceso = ultimoAcceso;
        Activo = activo;
        RolId = rolId;
        UsuarioIng = usuarioIng;
        FechaIng = fechaIng;
        UsuarioAct = usuarioAct;
        FechaAct = fechaAct;
    }

    public int UsuarioId { get; set; }

    public string NombreCompleto { get; set; } = null!;

    public string NombreUsuario { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public DateTime? UltimoAcceso { get; set; }

    public bool Activo { get; set; }

    public int RolId { get; set; }

    public int UsuarioIng { get; set; }

    public DateTime FechaIng { get; set; }

    public int? UsuarioAct { get; set; }

    public DateTime? FechaAct { get; set; }
}