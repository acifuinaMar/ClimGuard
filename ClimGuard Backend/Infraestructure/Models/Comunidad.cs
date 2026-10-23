using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class Comunidad
{
    public int ComunidadId { get; set; }

    public string NombreComunidad { get; set; } = null!;

    public string? Descripcion { get; set; }

    public string Pais { get; set; } = null!;

    public string Departamento { get; set; } = null!;

    public string Municipio { get; set; } = null!;

    public decimal Latitud { get; set; }

    public decimal Longitud { get; set; }

    public bool Activo { get; set; }

    public int UsuarioIng { get; set; }

    public DateTime FechaIng { get; set; }

    public int? UsuarioAct { get; set; }

    public DateTime? FechaAct { get; set; }

    public virtual ICollection<Alerta> Alerta { get; set; } = new List<Alerta>();

    public virtual ICollection<Sensor> Sensors { get; set; } = new List<Sensor>();

    public virtual Usuario UsuarioIngNavigation { get; set; } = null!;

    public virtual Usuario? UsuarioActNavigation { get; set; }
}