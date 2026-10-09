using Domain.Entities.PhenomenonType;
using Domain.Interfaces;
using Infraestructure.Models;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repositories
{
    public class TipoFenomenoRepository : ITipoFenomeno
    {
        private readonly MonitoreoContext _context;
        public TipoFenomenoRepository(MonitoreoContext context) => _context = context;
        public async Task<TipoFenomenoDomain> Create(TipoFenomenoDomain tipo)
        {
            try
            {
                var obj = new TipoFenomeno
                {

                    TipoFenomenoId = tipo.TipoFenomenoId,
                    Nombre = tipo.Nombre,
                    Activo = tipo.Activo,
                    UsuarioAct = tipo.UsuarioAct,
                    UsuarioIng = tipo.UsuarioIng,
                    FechaIng = tipo.FechaIng,
                    FechaAct = tipo.FechaAct
                };
                _context.TipoFenomenos.Add(obj);
                await _context.SaveChangesAsync();

                return new TipoFenomenoDomain
                (
                      tipo.TipoFenomenoId,
                      tipo.Nombre,
                      tipo.Activo,
                      tipo.UsuarioIng,
                      tipo.FechaIng,
                      tipo.UsuarioAct,
                      tipo.FechaAct
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Delete(TipoFenomenoDomain tipo)
        {
            var obj = await _context.TipoFenomenos
                .FirstOrDefaultAsync(a => a.TipoFenomenoId == tipo.TipoFenomenoId);

            if (obj == null)
                return false;

            _context.TipoFenomenos.Remove(obj);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IReadOnlyList<TipoFenomenoDomain>> GetAll()
        {
            try
            {
                var tipos = await _context.TipoFenomenos.ToListAsync();

                return tipos.Select(a => new TipoFenomenoDomain(
                    a.TipoFenomenoId,
                    a.Nombre,
                    a.Activo,
                    a.UsuarioIng,
                    a.FechaIng,
                    a.UsuarioAct,
                    a.FechaAct
            )).ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<TipoFenomenoDomain> GetById(int tipo)
        {
            try
            {
                var obj = await _context.TipoFenomenos
                    .Where(a => a.TipoFenomenoId == tipo).FirstOrDefaultAsync();

                if(obj == null)
                    return null;

                return new TipoFenomenoDomain
                (
                      obj.TipoFenomenoId,
                      obj.Nombre,
                      obj.Activo,
                      obj.UsuarioIng,
                      obj.FechaIng,
                      obj.UsuarioAct,
                      obj.FechaAct
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(TipoFenomenoDomain tipo)
        {
            try
            {
                var obj = await _context.TipoFenomenos
                    .FirstOrDefaultAsync(a => a.TipoFenomenoId == tipo.TipoFenomenoId);

                if (obj == null)
                    return false;

                obj.Nombre = tipo.Nombre;
                obj.Activo = tipo.Activo;
                obj.UsuarioIng = tipo.UsuarioIng;
                obj.FechaIng = tipo.FechaIng;
                obj.UsuarioAct = tipo.UsuarioAct;
                obj.FechaAct = tipo.FechaAct;

                _context.TipoFenomenos.Update(obj);
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
