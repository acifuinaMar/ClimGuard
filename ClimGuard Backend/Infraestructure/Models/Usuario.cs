using System;
using System.Collections.Generic;

namespace Infraestructure.Models;

public partial class Usuario
{
    public int UsuarioId { get; set; }

    public string Apellido2 { get; set; } = null!;

    public string Apellido1 { get; set; } = null!;

    public string Nombre2 { get; set; } = null!;

    public string Nombre1 { get; set; } = null!;

    public string NombreUsuario { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string Rol { get; set; } = null!;

    public bool Activo { get; set; }

    public DateTime FechaRegistro { get; set; }

    public virtual ICollection<Bitacora> Bitacoras { get; set; } = new List<Bitacora>();
}
