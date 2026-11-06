using Domain.Entities.Alert;
namespace Domain.Entities.AlertLevel;

public partial class NivelAlertaDomain
{
    public NivelAlertaDomain(int nivelAlertaId, string nombre, string colorHex,
        bool activo, int usuarioIng, DateTime fechaIng, int? usuarioAct, DateTime? fechaAct)
    {
        NivelAlertaId = nivelAlertaId;
        Nombre = nombre;
        ColorHex = colorHex;
        Activo = activo;
        UsuarioIng = usuarioIng;
        FechaIng = fechaIng;
        UsuarioAct = usuarioAct;
        FechaAct = fechaAct;
    }

    public int NivelAlertaId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string ColorHex { get; set; } = string.Empty;
    public bool Activo { get; set; }
    public int UsuarioIng { get; set; }
    public DateTime FechaIng { get; set; }
    public int? UsuarioAct { get; set; }
    public DateTime? FechaAct { get; set; }

    public virtual ICollection<AlertaDomain> Alerta { get; set; } = new List<AlertaDomain>();
}