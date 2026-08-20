namespace Domain.Entities.Login
{
    public class LoginDomain
    {
        public LoginDomain(string mensaje, string nombreUsuario, string rol)
        {
            Mensaje = mensaje;
            NombreUsuario = nombreUsuario;
            Rol = rol;
        }

        public string Mensaje { get; set; } = string.Empty;
        public string NombreUsuario { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty;

    }
}
