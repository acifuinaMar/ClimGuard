using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class Bitacora
{
    public int BitacoraId { get; set; }

    public int UsuarioId { get; set; }

    public string Accion { get; set; } = null!;

    public DateTime FechaRegistro { get; set; }

    public virtual Usuario Usuario { get; set; } = null!;
}
