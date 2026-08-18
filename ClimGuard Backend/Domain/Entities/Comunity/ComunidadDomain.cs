using Domain.Entities.Alert;
using Domain.Entities.Sensors;

namespace Domain.Entities.Comunity;

public partial class ComunidadDomain
{
    public ComunidadDomain(int comunidadId, string nombre, decimal latitud, decimal longitud, string descripcion, DateOnly fechaRegistro)
    {
        ComunidadId = comunidadId;
        Nombre = nombre;
        Latitud = latitud;
        Longitud = longitud;
        Descripcion = descripcion;
        FechaRegistro = fechaRegistro;
    }

    public int ComunidadId { get; set; }

    public string Nombre { get; set; } = string.Empty;

    public decimal Latitud { get; set; }

    public decimal Longitud { get; set; }

    public string Descripcion { get; set; } = string.Empty;

    public DateOnly FechaRegistro { get; set; }

    public virtual ICollection<AlertaDomain> Alerta { get; set; } = new List<AlertaDomain>();

    public virtual ICollection<SensorDomain> Sensors { get; set; } = new List<SensorDomain>();
}
