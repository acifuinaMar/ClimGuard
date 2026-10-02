using Domain.Entities.AlertLevel;
using Infraestructure.Models;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Services.Services.Interfaces;

namespace Infraestructure.Repositories
{
    public class NivelAlertaRepository : INivelAlerta
    {
        private readonly MonitoreoContext _context;
        public NivelAlertaRepository(MonitoreoContext context) => _context = context;
        public async Task<NivelAlertaDomain> Create(NivelAlertaDomain nivel)
        {
            try
            {
                var obj = new NivelAlerta
                {

                    NivelAlertaId = nivel.NivelAlertaId,
                    Nombre = nivel.Nombre,
                    ColorHex = nivel.ColorHex,
                    Orden = nivel.Orden
                };
                _context.NivelAlerta.Add(obj);
                await _context.SaveChangesAsync();

                return new NivelAlertaDomain
                (
                    nivel.NivelAlertaId,
                    nivel.Nombre,
                    nivel.ColorHex,
                    nivel.Orden
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Delete(NivelAlertaDomain nivel)
        {
            var obj = await _context.NivelAlerta
                .FirstOrDefaultAsync(a => a.NivelAlertaId == nivel.NivelAlertaId);

            if (obj == null)
                return false;

            _context.NivelAlerta.Remove(obj);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IReadOnlyList<NivelAlertaDomain>> GetAll()
        {
            try
            {
                var niveles = await _context.NivelAlerta.ToListAsync();

                return niveles.Select(a => new NivelAlertaDomain
                (
                    a.NivelAlertaId,
                    a.Nombre,
                    a.ColorHex,
                    a.Orden
                )).ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<NivelAlertaDomain> GetById(int nivel)
        {
            try
            {
                var obj = await _context.NivelAlerta
                    .Where(a => a.NivelAlertaId == nivel).FirstOrDefaultAsync();

                return new NivelAlertaDomain
                (
                    obj.NivelAlertaId,
                    obj.Nombre,
                    obj.ColorHex,
                    obj.Orden
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(NivelAlertaDomain nivel)
        {
            try
            {
                var obj = await _context.NivelAlerta
                    .FirstOrDefaultAsync(a => a.NivelAlertaId == nivel.NivelAlertaId);

                if (obj == null)
                    return false;


                //obj.NivelAlertaId = nivel.NivelAlertaId;
                obj.Nombre = nivel.Nombre;
                obj.ColorHex = nivel.ColorHex;
                obj.Orden = nivel.Orden;

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
