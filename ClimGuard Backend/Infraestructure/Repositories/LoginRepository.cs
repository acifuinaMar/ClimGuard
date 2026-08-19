using Domain.Entities.Login;
using Domain.Interfaces;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repositories
{
    public class LoginRepository : ILogin
    {
        private readonly MonitoreoContext _context;

        public LoginRepository(MonitoreoContext context)
        {
            _context = context;
        }

        public async Task<LoginDomain> IniciarSesion(string Usuario, string Contraseña)
        {
            // 1. Validar entradas
            if (string.IsNullOrWhiteSpace(Usuario) ||
                string.IsNullOrWhiteSpace(Contraseña))
            {
                return new LoginDomain
                (
                    Usuario,
                    false,
                    "Debe ingresar usuario y contraseña.",
                    string.Empty
                );
            }

            // 2. Buscar usuario
            var usuario = await _context.Usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(u =>
                    u.NombreUsuario == Usuario.Trim());

            // 3. Validar usuario
            if (usuario == null)
            {
                return new LoginDomain
                (
                    Usuario,
                    false,
                    "Usuario o contraseña incorrectos.",
                    string.Empty
                );
            }

            // 4. Validar estado
            if (!usuario.Activo)
            {
                return new LoginDomain
                (
                    usuario.NombreUsuario,
                    false,
                    "La cuenta se encuentra inactiva.",
                    string.Empty
                );
            }

            // 5. Validar contraseña
            bool esValido = BCrypt.Net.BCrypt.Verify(
                Contraseña,
                usuario.PasswordHash
            );

            if (!esValido)
            {
                return new LoginDomain
                (
                    usuario.NombreUsuario,
                    false,
                    "Usuario o contraseña incorrectos.",
                    string.Empty
                );
            }

            // 6. Autenticación exitosa
            return new LoginDomain
            (
                usuario.NombreUsuario,
                true,
                "Autenticación exitosa.",
                string.Empty
            );
        }
    }
}
