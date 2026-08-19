using Domain.Entities.User;
using Infraestructure.Models;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Services.Services.Interfaces;

namespace Services.Services
{
    public class UsuarioRepository : IUsuario
    {
        private readonly MonitoreoContext _context;
        public UsuarioRepository(MonitoreoContext context) => _context = context;

        public async Task<UsuarioDomain> Create(UsuarioDomain Usuario)
        {
            try
            {
                var usuario = new Usuario
                {
                    UsuarioId = Usuario.UsuarioId,
                    Nombre1 = Usuario.Nombre1,
                    Nombre2 = Usuario.Nombre2,
                    Apellido1 = Usuario.Apellido1,
                    Apellido2 = Usuario.Apellido2,
                    NombreUsuario = Usuario.NombreUsuario,
                    PasswordHash = Usuario.PasswordHash,
                    Rol = Usuario.Rol,
                    Activo = Usuario.Activo,
                    FechaRegistro = Usuario.FechaRegistro
                };
                _context.Usuarios.Add(usuario);
                await _context.SaveChangesAsync();

                return new UsuarioDomain
                (
                    usuario.UsuarioId,
                    usuario.Nombre1,
                    usuario.Nombre2,
                    usuario.Apellido1,
                    usuario.Apellido2,
                    usuario.NombreUsuario,
                    usuario.PasswordHash,
                    usuario.Rol,
                    usuario.Activo,
                    usuario.FechaRegistro
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Delete(UsuarioDomain UsuarioDomain)
        {
            var usuario = await _context.Usuarios
                .FirstOrDefaultAsync(a => a.UsuarioId == UsuarioDomain.UsuarioId);

            if (usuario == null)
                return false;

            _context.Usuarios.Remove(usuario);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IReadOnlyList<UsuarioDomain>> GetAll()
        {
            try
            {
                var usuario = await _context.Usuarios.ToListAsync();

                return usuario.Select(a => new UsuarioDomain
                (
                    a.UsuarioId,
                    a.Nombre1,
                    a.Nombre2,
                    a.Apellido1,
                    a.Apellido2,
                    a.NombreUsuario,
                    a.PasswordHash,
                    a.Rol,
                    a.Activo,
                    a.FechaRegistro
                )).ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<UsuarioDomain> GetById(int UsuarioId)
        {
            try
            {
                var usuario = await _context.Usuarios
                    .Where(a => a.UsuarioId == UsuarioId).FirstOrDefaultAsync();

                return new UsuarioDomain
                (
                    usuario.UsuarioId,
                    usuario.Nombre1,
                    usuario.Nombre2,
                    usuario.Apellido1,
                    usuario.Apellido2,
                    usuario.NombreUsuario,
                    usuario.PasswordHash,
                    usuario.Rol,
                    usuario.Activo,
                    usuario.FechaRegistro
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(UsuarioDomain UsuarioDomain)
        {
            try
            {
                var usuario = await _context.Usuarios
                    .FirstOrDefaultAsync(a => a.UsuarioId == UsuarioDomain.UsuarioId);

                if (usuario == null)
                    return false;

                usuario.Nombre1 = UsuarioDomain.Nombre1;
                usuario.Nombre2 = UsuarioDomain.Nombre2;
                usuario.Apellido1 = UsuarioDomain.Apellido1;
                usuario.Apellido2 = UsuarioDomain.Apellido2;
                usuario.NombreUsuario = UsuarioDomain.NombreUsuario;
                usuario.PasswordHash = UsuarioDomain.PasswordHash;
                usuario.Rol = UsuarioDomain.Rol;
                usuario.Activo = UsuarioDomain.Activo;
                usuario.FechaRegistro = UsuarioDomain.FechaRegistro;

                await _context.SaveChangesAsync();

                return true;
            }
            catch
            {
                throw;
            }
        }
    }
}
