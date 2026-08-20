using Domain.Bitacora;
using Domain.Interfaces;
using Infraestructure.Models;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Repositories
{
    public class BitacoraRepository : IBitacora
    {
        private readonly MonitoreoContext _context;

        public BitacoraRepository(MonitoreoContext context)
        {
            _context = context;
        }

        public async Task<bool> Create(BitacoraDomain bitacora)
        {
            try
            {
                var obj = new Bitacora
                {
                    BitacoraId = bitacora.BitacoraId,
                    UsuarioId = bitacora.UsuarioId,
                    Accion = bitacora.Accion,
                    FechaRegistro = bitacora.FechaRegistro
                };
                _context.Bitacoras.Add(obj);
                await _context.SaveChangesAsync();

                return true;
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<IReadOnlyList<BitacoraDomain>> GetAll()
        {
            try
            {
                var obj = await _context.Bitacoras.ToListAsync();

                return obj.Select(a => new BitacoraDomain
                (
                    a.BitacoraId,
                    a.UsuarioId,
                    a.Accion,
                    a.FechaRegistro
                )).ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
