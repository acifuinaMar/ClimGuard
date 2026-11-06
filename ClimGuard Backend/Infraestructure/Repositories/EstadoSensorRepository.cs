using Domain.Entities.EstadoSensor;
using Infraestructure.Models;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Domain.Interfaces;

namespace Infraestructure.Repositories
{
    public class EstadoSensorRepository : IEstadoSensor
    {
        private readonly MonitoreoContext _context;
        public EstadoSensorRepository(MonitoreoContext context) => _context = context;
        public async Task<EstadoSensorDomain> Create(EstadoSensorDomain nivel)
        {
            try
            {
                var obj = new EstadoSensor
                {

                    EstadoSensorId = nivel.EstadoSensorId,
                    Nombre = nivel.Nombre,
                    Activo = nivel.Activo
                };
                _context.EstadoSensors.Add(obj);
                await _context.SaveChangesAsync();

                return new EstadoSensorDomain
                (
                    nivel.EstadoSensorId,
                    nivel.Nombre,
                    nivel.Activo
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Delete(EstadoSensorDomain nivel)
        {
            var obj = await _context.EstadoSensors
                .FirstOrDefaultAsync(a => a.EstadoSensorId == nivel.EstadoSensorId);

            if (obj == null)
                return false;

            _context.EstadoSensors.Remove(obj);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IReadOnlyList<EstadoSensorDomain>> GetAll()
        {
            try
            {
                var niveles = await _context.EstadoSensors.ToListAsync();

                return niveles.Select(a => new EstadoSensorDomain
                (
                    a.EstadoSensorId,
                    a.Nombre,
                    a.Activo
                )).ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<EstadoSensorDomain> GetById(int nivel)
        {
            try
            {
                var obj = await _context.EstadoSensors
                    .Where(a => a.EstadoSensorId == nivel).FirstOrDefaultAsync();

                if (obj == null)
                    return null;

                return new EstadoSensorDomain
                (
                    obj.EstadoSensorId,
                    obj.Nombre,
                    obj.Activo
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(EstadoSensorDomain nivel)
        {
            try
            {
                var obj = await _context.EstadoSensors
                    .FirstOrDefaultAsync(a => a.EstadoSensorId == nivel.EstadoSensorId);

                if (obj == null)
                    return false;

                //obj.EstadoSensorId = nivel.EstadoSensorId;
                obj.Nombre = nivel.Nombre;
                obj.Activo = nivel.Activo;

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
