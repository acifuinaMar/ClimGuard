using Domain.Entities.Alert;

namespace Domain.Entities.AlertLevel;

public partial class NivelAlertaDomain
{
    public NivelAlertaDomain(int nivelAlertaId, string nombre, string colorHex, int orden)
    {
        NivelAlertaId = nivelAlertaId;
        Nombre = nombre;
        ColorHex = colorHex;
        Orden = orden;
    }

    public int NivelAlertaId { get; set; }

    public string Nombre { get; set; } = null!;

    public string ColorHex { get; set; } = null!;

    public int Orden { get; set; }

    public virtual ICollection<AlertaDomain> Alerta { get; set; } = new List<AlertaDomain>();
}
