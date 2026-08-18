using Domain.Entities.Comunity;
using Infraestructure.Models;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Services.Services.Interfaces;

namespace Services.Services
{
    public class ComunidadRepository : IComunidad
    {
        private readonly MonitoreoContext _context;
        public ComunidadRepository(MonitoreoContext context) => _context = context; 
        public async Task<ComunidadDomain> Create(ComunidadDomain comunidad)
        {
            try
            {
                var obj = new Comunidad
                {
                    ComunidadId = comunidad.ComunidadId,
                    Nombre = comunidad.Nombre,
                    Latitud = comunidad.Latitud,
                    Longitud = comunidad.Longitud,
                    Descripcion = comunidad.Descripcion,
                    FechaRegistro = comunidad.FechaRegistro.ToDateTime(TimeOnly.MinValue)
                };
                _context.Comunidads.Add(obj);
                await _context.SaveChangesAsync();

                return new ComunidadDomain
                (
                    comunidad.ComunidadId,
                    comunidad.Nombre,
                    comunidad.Latitud,
                    comunidad.Longitud,
                    comunidad.Descripcion,
                    comunidad.FechaRegistro
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Delete(ComunidadDomain comunidad)
        {
            var obj = await _context.Comunidads
                .FirstOrDefaultAsync(a => a.ComunidadId == comunidad.ComunidadId);

            if (obj == null)
                return false;

            _context.Comunidads.Remove(obj);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IReadOnlyList<ComunidadDomain>> GetAll()
        {
            try
            {
                var comunidad = await _context.Comunidads.ToListAsync();

                return comunidad.Select(a => new ComunidadDomain
                (
                    a.ComunidadId,
                    a.Nombre,
                    a.Latitud,
                    a.Longitud,
                    a.Descripcion,
                    DateOnly.FromDateTime(a.FechaRegistro)
                )).ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<ComunidadDomain> GetById(int comunidadId)
        {
            try
            {
                var obj = await _context.Comunidads
                    .Where(a => a.ComunidadId == comunidadId).FirstOrDefaultAsync();

                return new ComunidadDomain
                (
                    obj.ComunidadId,
                    obj.Nombre,
                    obj.Latitud,
                    obj.Longitud,
                    obj.Descripcion,
                    DateOnly.FromDateTime(obj.FechaRegistro)
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(ComunidadDomain comunidad)
        {
            try
            {
                var obj = await _context.Comunidads
                    .FirstOrDefaultAsync(a => a.ComunidadId == comunidad.ComunidadId);

                if (obj == null)
                    return false;

                obj.ComunidadId = comunidad.ComunidadId;
                obj.Nombre = comunidad.Nombre;
                obj.Latitud = comunidad.Latitud;
                obj.Longitud = comunidad.Longitud;
                obj.Descripcion = comunidad.Descripcion;
                obj.FechaRegistro = comunidad.FechaRegistro.ToDateTime(TimeOnly.MinValue);

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
