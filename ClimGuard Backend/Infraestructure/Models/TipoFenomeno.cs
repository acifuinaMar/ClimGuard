using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class TipoFenomeno
{
    public int TipoFenomenoId { get; set; }

    public string Nombre { get; set; } = null!;

    public virtual ICollection<Alerta> Alerta { get; set; } = new List<Alerta>();
}
