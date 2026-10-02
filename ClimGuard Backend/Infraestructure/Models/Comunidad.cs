using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class Comunidad
{
    public int ComunidadId { get; set; }

    public string Nombre { get; set; } = null!;

    public decimal Latitud { get; set; }

    public decimal Longitud { get; set; }

    public string Descripcion { get; set; }

    public DateTime FechaRegistro { get; set; }

    public virtual ICollection<Alerta> Alerta { get; set; } = new List<Alerta>();

    public virtual ICollection<Sensor> Sensors { get; set; } = new List<Sensor>();
}
