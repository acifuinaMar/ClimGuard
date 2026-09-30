using Domain.Entities.Alert;

namespace Domain.Entities.PhenomenonType;

public partial class TipoFenomenoDomain
{
    public TipoFenomenoDomain(
        int tipoFenomenoId,
        string nombre)
    {
        TipoFenomenoId = tipoFenomenoId;
        Nombre = nombre;
    }

    public int TipoFenomenoId { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<AlertaDomain> Alerta { get; set; } = new List<AlertaDomain>();
}