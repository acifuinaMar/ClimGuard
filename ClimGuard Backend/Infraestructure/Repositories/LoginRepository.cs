using Application.Common.Encrypt;
using Domain.Entities.Login;
using Domain.Interfaces;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repositories
{
    public class LoginRepository : ILogin
    {
        private readonly MonitoreoContext _context;
        private readonly EncryptPassword _encrypt;

        public LoginRepository(MonitoreoContext context, EncryptPassword encrypt)
        {
            _context = context;
            _encrypt = encrypt;
        }

        public async Task<LoginDomain> IniciarSesion(string Usuario,string Contraseña)
        {
            // 1. Validar entradas
            if (string.IsNullOrWhiteSpace(Usuario) ||
                string.IsNullOrWhiteSpace(Contraseña))
            {
                return new LoginDomain(
                     0,
                     "Debe ingresar usuario y contraseña.",
                     "",
                     ""
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
                return new LoginDomain(
                    0,
                    "Usuario o contraseña incorrectos.",
                    "",
                    ""
                );
            }

            // 4. Validar estado
            if (!usuario.Activo)
            {
                return new LoginDomain(
                    0,
                    "La cuenta se encuentra inactiva.",
                    "",
                    ""
                );
            }

            // 5. Validar contraseña
            string hashIngresado = _encrypt.encryptSHA256(Contraseña);

            bool esValido = hashIngresado == usuario.PasswordHash;

            if (!esValido)
            {
                return new LoginDomain(
                    0,
                    "Usuario o contraseña incorrectos.",
                    "",
                    ""
                );
            }

            // 6. Autenticación exitosa
            return new LoginDomain(
                usuario.UsuarioId,
                "Autenticación exitosa.",
                usuario.NombreUsuario,
                usuario.Rol
            );
        }
    }
}
