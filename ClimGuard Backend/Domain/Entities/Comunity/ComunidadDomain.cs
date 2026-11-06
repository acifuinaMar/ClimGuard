using Domain.Entities.Alert;
using Domain.Entities.Sensors;

namespace Domain.Entities.Comunity;

public partial class ComunidadDomain
{
    public ComunidadDomain(
        int comunidadId,
        string nombreComunidad,
        string? descripcion,
        string pais,
        string departamento,
        string municipio,
        decimal latitud,
        decimal longitud,
        bool activo,
        int usuarioIng,
        DateTime fechaIng,
        int? usuarioAct,
        DateTime? fechaAct)
    {
        ComunidadId = comunidadId;
        NombreComunidad = nombreComunidad;
        Descripcion = descripcion;
        Pais = pais;
        Departamento = departamento;
        Municipio = municipio;
        Latitud = latitud;
        Longitud = longitud;
        Activo = activo;
        UsuarioIng = usuarioIng;
        FechaIng = fechaIng;
        UsuarioAct = usuarioAct;
        FechaAct = fechaAct;
    }

    public int ComunidadId { get; set; }

    public string NombreComunidad { get; set; } = string.Empty;

    public string? Descripcion { get; set; }

    public string Pais { get; set; } = string.Empty;

    public string Departamento { get; set; } = string.Empty;

    public string Municipio { get; set; } = string.Empty;

    public decimal Latitud { get; set; }

    public decimal Longitud { get; set; }

    public bool Activo { get; set; }

    public int UsuarioIng { get; set; }

    public DateTime FechaIng { get; set; }

    public int? UsuarioAct { get; set; }

    public DateTime? FechaAct { get; set; }

    public virtual ICollection<AlertaDomain> Alerta { get; set; } = new List<AlertaDomain>();

    public virtual ICollection<SensorDomain> Sensors { get; set; } = new List<SensorDomain>();
}