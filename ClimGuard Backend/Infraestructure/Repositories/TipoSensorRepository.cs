using Domain.Entities.SensorType;
using Infraestructure.Models;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Domain.Interfaces;

namespace Infraestructure.Repositories
{
    public class TipoSensorRepository : ITipoSensor
    {
        private readonly MonitoreoContext _context;
        public TipoSensorRepository(MonitoreoContext context) => _context = context;
        public async Task<TipoSensorDomain> Create(TipoSensorDomain tipo)
        {
            try
            {
                var obj = new TipoSensor
                {

                    TipoSensorId = tipo.TipoSensorId,
                    Nombre = tipo.Nombre,
                    UnidadMedida = tipo.UnidadMedida
                };
                _context.TipoSensors.Add(obj);
                await _context.SaveChangesAsync();

                return new TipoSensorDomain
                (
                    tipo.TipoSensorId,
                    tipo.Nombre,
                    tipo.UnidadMedida
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Delete(TipoSensorDomain tipo)
        {
            var obj = await _context.TipoSensors
                .FirstOrDefaultAsync(a => a.TipoSensorId == tipo.TipoSensorId);

            if (obj == null)
                return false;

            _context.TipoSensors.Remove(obj);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IReadOnlyList<TipoSensorDomain>> GetAll()
        {
            try
            {
                var tipos = await _context.TipoSensors.ToListAsync();

                return tipos.Select(a => new TipoSensorDomain(
                a.TipoSensorId,
                a.Nombre,
                a.UnidadMedida
            )).ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<TipoSensorDomain> GetById(int tipo)
        {
            try
            {
                var obj = await _context.TipoSensors
                    .Where(a => a.TipoSensorId == tipo).FirstOrDefaultAsync();

                return new TipoSensorDomain
                (
                    obj.TipoSensorId,
                    obj.Nombre,
                    obj.UnidadMedida
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(TipoSensorDomain tipo)
        {
            try
            {
                var obj = await _context.TipoSensors
                    .FirstOrDefaultAsync(a => a.TipoSensorId == tipo.TipoSensorId);

                if (obj == null)
                    return false;

                obj.Nombre = tipo.Nombre;
                obj.UnidadMedida = tipo.UnidadMedida;

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
