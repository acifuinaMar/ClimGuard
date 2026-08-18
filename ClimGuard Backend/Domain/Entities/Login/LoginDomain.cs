namespace Domain.Entities.Login
{
    public class LoginDomain
    {
        public LoginDomain(string usuario, bool exito, string mensaje, string token)
        {
            this.usuario = usuario;
            Exito = exito;
            Mensaje = mensaje;
            Token = token;
        }

        public string usuario { get; set; } = string.Empty;
        public bool Exito { get; set; } 
        public string Mensaje { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;

    }
}
