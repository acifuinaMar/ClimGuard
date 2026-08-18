using Domain.Entities.Sensors;
using Infraestructure.Models;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Services.Services.Interfaces;

namespace Services.Services
{
    public class SensorRepository : ISensor
    {
        private readonly MonitoreoContext _context;
        public SensorRepository(MonitoreoContext context) => _context = context; 
        public async Task<SensorDomain> Create(SensorDomain sensor)
        {
            try
            {
                var obj = new Sensor
                {
                    SensorId = sensor.SensorId,
                    ComunidadId = sensor.ComunidadId,
                    TipoSensorId = sensor.TipoSensorId,
                    Nombre = sensor.Nombre,
                    ValorActual = sensor.ValorActual,
                    Activo = sensor.Activo,
                    FechaInstalacion = sensor.FechaInstalacion,
                    UltimaActualizacion = sensor.UltimaActualizacion
                };
                _context.Sensors.Add(obj);
                await _context.SaveChangesAsync();

                return new SensorDomain
                (
                    sensor.SensorId,
                    sensor.ComunidadId,
                    sensor.TipoSensorId,
                    sensor.Nombre,
                    sensor.ValorActual,
                    sensor.Activo,
                    sensor.FechaInstalacion,
                    sensor.UltimaActualizacion
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Delete(SensorDomain sensor)
        {
            var obj = await _context.Sensors
                .FirstOrDefaultAsync(a => a.SensorId == sensor.SensorId);

            if (obj == null)
                return false;

            _context.Sensors.Remove(obj);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IReadOnlyList<SensorDomain>> GetAll()
        {
            try
            {
                var obj = await _context.Sensors.ToListAsync();

                return obj.Select(a => new SensorDomain
                (
                    a.SensorId,
                    a.ComunidadId,
                    a.TipoSensorId,
                    a.Nombre,
                    a.ValorActual,
                    a.Activo,
                    a.FechaInstalacion,
                    a.UltimaActualizacion
                )).ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<SensorDomain> GetById(int sensor)
        {
            try
            {
                var obj = await _context.Sensors
                    .Where(a => a.SensorId == sensor).FirstOrDefaultAsync();

                return new SensorDomain
                (
                    obj.SensorId,
                    obj.ComunidadId,
                    obj.TipoSensorId,
                    obj.Nombre,
                    obj.ValorActual,
                    obj.Activo,
                    obj.FechaInstalacion,
                    obj.UltimaActualizacion
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(SensorDomain sensor)
        {
            try
            {
                var obj = await _context.Sensors
                    .FirstOrDefaultAsync(a => a.SensorId == sensor.SensorId);

                if (obj == null)
                    return false;

                obj.SensorId = sensor.SensorId;
                obj.ComunidadId = sensor.ComunidadId;
                obj.TipoSensorId = sensor.TipoSensorId;
                obj.Nombre = sensor.Nombre;
                obj.ValorActual = sensor.ValorActual;
                obj.Activo = sensor.Activo;
                obj.FechaInstalacion = sensor.FechaInstalacion;
                obj.UltimaActualizacion = sensor.UltimaActualizacion;

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
