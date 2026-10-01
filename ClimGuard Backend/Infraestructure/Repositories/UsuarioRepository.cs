using Domain.Entities.User;
using Domain.Interfaces;
using Infraestructure.Models;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repositories
{
    public class UsuarioRepository : IUsuario
    {
        private readonly MonitoreoContext _context;

        public UsuarioRepository(MonitoreoContext context)
            => _context = context;

        public async Task<UsuarioDomain> Create(UsuarioDomain usuario)
        {
            var obj = new Usuario
            {
                UsuarioId = usuario.UsuarioId,
                NombreCompleto = usuario.NombreCompleto,
                NombreUsuario = usuario.NombreUsuario,
                PasswordHash = usuario.PasswordHash,
                UltimoAcceso = usuario.UltimoAcceso,
                Activo = usuario.Activo,
                RolId = usuario.RolId,
                UsuarioIng = usuario.UsuarioIng,
                FechaIng = usuario.FechaIng,
                UsuarioAct = usuario.UsuarioAct,
                FechaAct = usuario.FechaAct
            };

            _context.Usuarios.Add(obj);
            await _context.SaveChangesAsync();

            return new UsuarioDomain(
                obj.UsuarioId,
                obj.NombreCompleto,
                obj.NombreUsuario,
                obj.PasswordHash,
                obj.UltimoAcceso,
                obj.Activo,
                obj.RolId,
                obj.UsuarioIng,
                obj.FechaIng,
                obj.UsuarioAct,
                obj.FechaAct
            );
        }

        public async Task<bool> Delete(UsuarioDomain usuario)
        {
            var obj = await _context.Usuarios
                .FirstOrDefaultAsync(x => x.UsuarioId == usuario.UsuarioId);

            if (obj == null)
                return false;

            _context.Usuarios.Remove(obj);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IReadOnlyList<UsuarioDomain>> GetAll()
        {
            var usuarios = await _context.Usuarios.ToListAsync();

            return usuarios.Select(x => new UsuarioDomain(
                x.UsuarioId,
                x.NombreCompleto,
                x.NombreUsuario,
                x.PasswordHash,
                x.UltimoAcceso,
                x.Activo,
                x.RolId,
                x.UsuarioIng,
                x.FechaIng,
                x.UsuarioAct,
                x.FechaAct
            )).ToList();
        }

        public async Task<UsuarioDomain> GetById(int id)
        {
            var obj = await _context.Usuarios
                .FirstOrDefaultAsync(x => x.UsuarioId == id);

            return new UsuarioDomain(
                obj.UsuarioId,
                obj.NombreCompleto,
                obj.NombreUsuario,
                obj.PasswordHash,
                obj.UltimoAcceso,
                obj.Activo,
                obj.RolId,
                obj.UsuarioIng,
                obj.FechaIng,
                obj.UsuarioAct,
                obj.FechaAct
            );
        }

        public async Task<bool> Update(UsuarioDomain usuario)
        {
            var obj = await _context.Usuarios
                .FirstOrDefaultAsync(x => x.UsuarioId == usuario.UsuarioId);

            if (obj == null)
                return false;

            obj.NombreCompleto = usuario.NombreCompleto;
            obj.NombreUsuario = usuario.NombreUsuario;
            obj.PasswordHash = usuario.PasswordHash;
            obj.UltimoAcceso = usuario.UltimoAcceso;
            obj.Activo = usuario.Activo;
            obj.RolId = usuario.RolId;
            obj.UsuarioIng = usuario.UsuarioIng;
            obj.FechaIng = usuario.FechaIng;
            obj.UsuarioAct = usuario.UsuarioAct;
            obj.FechaAct = usuario.FechaAct;

            await _context.SaveChangesAsync();

            return true;
        }
    }
}