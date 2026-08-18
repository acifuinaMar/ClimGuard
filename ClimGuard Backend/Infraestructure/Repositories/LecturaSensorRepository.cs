using Domain.Entities.Alert;
using Domain.Entities.SensorReading;
using Infraestructure.Models;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Services.Services.Interfaces;
using System.Drawing;

namespace Infraestructure.Repositories
{
    public class LecturaSensorRepository : ILecturaSensor
    {
        private readonly MonitoreoContext _context;
        public LecturaSensorRepository(MonitoreoContext context) => _context = context;
        public async Task<LecturaSensorDomain> Create(LecturaSensorDomain lectura)
        {
            try
            {
                var obj = new LecturaSensor
                {

                    LecturaId = lectura.LecturaId,
                    SensorId = lectura.SensorId,
                    Valor = lectura.Valor,
                    FechaHora = lectura.FechaHora
                };
                _context.LecturaSensors.Add(obj);
                await _context.SaveChangesAsync();

                return new LecturaSensorDomain
                (
                    lectura.LecturaId,
                    lectura.SensorId,
                    lectura.Valor,
                    lectura.FechaHora
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Delete(LecturaSensorDomain lectura)
        {
            var obj = await _context.LecturaSensors
                .FirstOrDefaultAsync(a => a.LecturaId == lectura.LecturaId);

            if (obj == null)
                return false;

            _context.LecturaSensors.Remove(obj);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IReadOnlyList<LecturaSensorDomain>> GetAll()
        {
            try
            {
                var list = await _context.LecturaSensors.ToListAsync();

                return list.Select(a => new LecturaSensorDomain
                (
                    a.LecturaId,
                    a.SensorId,
                    a.Valor,
                    a.FechaHora
                )).ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<LecturaSensorDomain> GetById(int lectura)
        {
            try
            {
                var obj = await _context.LecturaSensors
                    .Where(a => a.LecturaId == lectura).FirstOrDefaultAsync();

                return new LecturaSensorDomain
                (
                    obj.LecturaId,
                    obj.SensorId,
                    obj.Valor,
                    obj.FechaHora
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(LecturaSensorDomain lectura)
        {
            try
            {
                var obj = await _context.LecturaSensors
                    .FirstOrDefaultAsync(a => a.LecturaId == lectura.LecturaId);

                if (obj == null)
                    return false;

                //obj.LecturaId = lecturaId;
                obj.SensorId = lectura.SensorId;
                obj.Valor = lectura.Valor;
                obj.FechaHora = lectura.FechaHora;

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
