using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class Bitacora
{
    public long BitacoraId { get; set; }

    public string NombreEntidad { get; set; } = null!;

    public long EntidadId { get; set; }

    public string Accion { get; set; } = null!;

    public string Descripcion { get; set; } = null!;

    public DateTime FechaHora { get; set; }

    public int UsuarioId { get; set; }

    public virtual Usuario Usuario { get; set; } = null!;
}