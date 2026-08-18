using Domain.Entities.Login;

namespace Domain.Interfaces
{
    public interface ILogin
    {
        Task<LoginDomain> IniciarSesion(string Usuario, string Contraseña);
    }
}
