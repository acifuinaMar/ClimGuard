using Domain.Entities.Alert;

namespace Domain.Entities.PhenomenonType;

public partial class TipoFenomenoDomain
{
    public TipoFenomenoDomain(int tipoFenomenoId, string nombre, bool activo, int usuarioIng, DateTime fechaIng, int? usuarioAct, DateTime? fechaAct)
    {
        TipoFenomenoId = tipoFenomenoId;
        Nombre = nombre;
        Activo = activo;
        UsuarioIng = usuarioIng;
        FechaIng = fechaIng;
        UsuarioAct = usuarioAct;
        FechaAct = fechaAct;
    }

    public int TipoFenomenoId { get; set; }

    public string Nombre { get; set; } = null!;

    public bool Activo { get; set; }

    public int UsuarioIng { get; set; }

    public DateTime FechaIng { get; set; }

    public int? UsuarioAct { get; set; }

    public DateTime? FechaAct { get; set; }
    public virtual ICollection<AlertaDomain> Alerta { get; set; } = new List<AlertaDomain>();
}