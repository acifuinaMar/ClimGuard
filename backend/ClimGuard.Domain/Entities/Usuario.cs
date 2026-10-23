namespace ClimGuard.Domain.Entities;

/// <summary>
/// Usuario del sistema.
///
/// CORRECCION respecto a DOC-09/DOC-10: el campo se llamaba "password".
/// Aqui se llama PasswordHash, y el nombre ES la correccion.
///
/// Un campo llamado "password" invita a que alguien escriba
/// usuario.Password = txtClave.Text  y lo guarde tal cual.
/// Un campo llamado PasswordHash hace que ese mismo codigo se vea mal
/// a simple vista. El nombre es la primera linea de defensa.
///
/// La contrasena en texto plano NUNCA existe como propiedad de esta clase.
/// Entra por el servicio de autenticacion, se hashea, y solo el hash vive aqui.
/// </summary>
public class Usuario
{
    public int IdUsuario { get; set; }
    public int IdRol { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;

    /// <summary>Resultado del hasheo con sal. Jamas la contrasena real.</summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>RNF-004: un usuario inactivo no puede iniciar sesion.</summary>
    public bool Activo { get; set; } = true;

    public DateTime FechaCreacion { get; set; }
    public DateTime? UltimoAcceso { get; set; }

    public Rol? Rol { get; set; }
}
