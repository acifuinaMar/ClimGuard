using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class NivelAlerta
{
    public int NivelAlertaId { get; set; }

    public string Nombre { get; set; } = null!;

    public string ColorHex { get; set; } = null!;

    public int Orden { get; set; }

    public virtual ICollection<Alerta> Alerta { get; set; } = new List<Alerta>();
}
