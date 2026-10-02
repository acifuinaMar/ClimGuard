
using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class NivelAlerta
{
    public int NivelAlertaId { get; set; }

    public string Nombre { get; set; } = string.Empty;

    public string ColorHex { get; set; } = string.Empty;

    public bool Activo { get; set; }

    public int UsuarioIng { get; set; }

    public DateTime FechaIng { get; set; }

    public int? UsuarioAct { get; set; }

    public DateTime? FechaAct { get; set; }

    public virtual ICollection<Alerta> Alerta { get; set; } = new List<Alerta>();

    public virtual ICollection<ReglaAlerta> ReglaAlertas { get; set; } = new List<ReglaAlerta>();
}