namespace Infraestructure.Models;

public partial class Usuario
{
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

    public virtual Rol Rol { get; set; } = null!;

    public virtual ICollection<Bitacora> Bitacoras { get; set; } = new List<Bitacora>();

    public virtual ICollection<Alerta> Alertas { get; set; } = new List<Alerta>();
    public virtual ICollection<ReglaAlerta> ReglaAlertumUsuarioActNavigations { get; set; } = new List<ReglaAlerta>();
    public virtual ICollection<ReglaAlerta> ReglaAlertumUsuarioIngNavigations { get; set; } = new List<ReglaAlerta>();
}