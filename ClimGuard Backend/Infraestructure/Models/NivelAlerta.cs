using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class NivelAlerta
{
    public int NivelAlertaId { get; set; }

    public string Nombre { get; set; } = null!;

    public string ColorHex { get; set; } = null!;

    public bool Activo { get; set; }

    public int UsuarioIng { get; set; }

    public DateTime FechaIng { get; set; }

    public int? UsuarioAct { get; set; }

    public DateTime? FechaAct { get; set; }

    public virtual ICollection<ReglaAlerta> ReglaAlertas { get; set; } = new List<ReglaAlerta>();
}
