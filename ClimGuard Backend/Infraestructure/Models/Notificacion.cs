using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class Notificacion
{
    public int NotificacionId { get; set; }

    public DateTime FechaEnvio { get; set; }

    public bool? Leido { get; set; }
}
