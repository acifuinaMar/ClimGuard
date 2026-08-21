namespace Domain.Entities.Login
{
    public class LoginDomain
    {
        public LoginDomain(
            int usuarioId,
            string mensaje,
            string nombreUsuario,
            string rol)
        {
            UsuarioId = usuarioId;
            Mensaje = mensaje;
            NombreUsuario = nombreUsuario;
            Rol = rol;
        }

        public int UsuarioId { get; set; }

        public string Mensaje { get; set; } = string.Empty;

        public string NombreUsuario { get; set; } = string.Empty;

        public string Rol { get; set; } = string.Empty;
    }
}