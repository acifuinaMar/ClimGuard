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
                    NombreComunidad = comunidad.NombreComunidad,
                    Descripcion = comunidad.Descripcion,
                    Pais = comunidad.Pais,
                    Departamento = comunidad.Departamento,
                    Municipio = comunidad.Municipio,
                    Latitud = comunidad.Latitud,
                    Longitud = comunidad.Longitud,
                    Activo = comunidad.Activo,
                    UsuarioIng = comunidad.UsuarioIng,
                    FechaIng = comunidad.FechaIng,
                    UsuarioAct = comunidad.UsuarioAct,
                    FechaAct = comunidad.FechaAct
                };
                _context.Comunidads.Add(obj);
                await _context.SaveChangesAsync();

                return new ComunidadDomain(
                    obj.ComunidadId,
                    obj.NombreComunidad,
                    obj.Descripcion,
                    obj.Pais,
                    obj.Departamento,
                    obj.Municipio,
                    obj.Latitud,
                    obj.Longitud,
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

                return comunidad.Select(a => new ComunidadDomain(
                    a.ComunidadId,
                    a.NombreComunidad,
                    a.Descripcion,
                    a.Pais,
                    a.Departamento,
                    a.Municipio,
                    a.Latitud,
                    a.Longitud,
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

        public async Task<ComunidadDomain> GetById(int comunidadId)
        {
            try
            {
                var obj = await _context.Comunidads
                    .Where(a => a.ComunidadId == comunidadId).FirstOrDefaultAsync();

                return new ComunidadDomain(
                    obj.ComunidadId,
                    obj.NombreComunidad,
                    obj.Descripcion,
                    obj.Pais,
                    obj.Departamento,
                    obj.Municipio,
                    obj.Latitud,
                    obj.Longitud,
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

        public async Task<bool> Update(ComunidadDomain comunidad)
        {
            try
            {
                var obj = await _context.Comunidads
                    .FirstOrDefaultAsync(a => a.ComunidadId == comunidad.ComunidadId);

                if (obj == null)
                    return false;

                obj.NombreComunidad = comunidad.NombreComunidad;
                obj.Descripcion = comunidad.Descripcion;
                obj.Pais = comunidad.Pais;
                obj.Departamento = comunidad.Departamento;
                obj.Municipio = comunidad.Municipio;
                obj.Latitud = comunidad.Latitud;
                obj.Longitud = comunidad.Longitud;
                obj.Activo = comunidad.Activo;
                obj.UsuarioAct = comunidad.UsuarioAct;
                obj.FechaAct = comunidad.FechaAct;
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
