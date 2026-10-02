using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class EstadoAlerta
{
    public int EstadoAlertaId { get; set; }

    public string Estado { get; set; } = null!;
}
