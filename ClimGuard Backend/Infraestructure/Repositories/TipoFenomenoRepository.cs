using Domain.Entities.PhenomenonType;
using Infraestructure.Models;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Domain.Interfaces;

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
                    Nombre = tipo.Nombre
                };
                _context.TipoFenomenos.Add(obj);
                await _context.SaveChangesAsync();

                return new TipoFenomenoDomain
                (
                    tipo.TipoFenomenoId,
                    tipo.Nombre
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
                a.Nombre
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

                return new TipoFenomenoDomain
                (
                    obj.TipoFenomenoId,
                    obj.Nombre
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
