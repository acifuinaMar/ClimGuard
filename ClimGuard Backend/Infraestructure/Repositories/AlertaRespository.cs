using Domain.Entities.Alert;
using Infraestructure.Models;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Services.Services.Interfaces;

namespace Infraestructure.Repositories
{
    public class AlertaRespository : IAlerta
    {
        private readonly MonitoreoContext _context;
        public AlertaRespository(MonitoreoContext context) => _context = context;
        public async Task<AlertaDomain> Create(AlertaDomain alerta)
        {
            try
            {
                var obj = new Alerta
                {

                    AlertaId = alerta.AlertaId,
                    ComunidadId = alerta.ComunidadId,
                    SensorId = alerta.SensorId,
                    TipoFenomenoId = alerta.TipoFenomenoId,
                    NivelAlertaId = alerta.NivelAlertaId,
                    Mensaje = alerta.Mensaje,
                    FechaHora = alerta.FechaHora,
                    Activa = alerta.Activa,
                    FechaResolucion = alerta.FechaResolucion
                };
                _context.Alerta.Add(obj);
                await _context.SaveChangesAsync();

                return new AlertaDomain
                (
                    alerta.AlertaId,
                    alerta.ComunidadId,
                    alerta.SensorId,
                    alerta.TipoFenomenoId,
                    alerta.NivelAlertaId,
                    alerta.Mensaje,
                    alerta.FechaHora,
                    alerta.Activa,
                    alerta.FechaResolucion
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Delete(AlertaDomain alerta)
        {
            var obj = await _context.Alerta
                .FirstOrDefaultAsync(a => a.AlertaId == alerta.AlertaId);

            if (obj == null)
                return false;

            _context.Alerta.Remove(obj);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IReadOnlyList<AlertaDomain>> GetAll()
        {
            try
            {
                var list = await _context.Alerta.ToListAsync();

                return list.Select(a => new AlertaDomain
                (
                    Convert.ToInt32(a.AlertaId),
                    a.ComunidadId,
                    a.SensorId,
                    a.TipoFenomenoId,
                    a.NivelAlertaId,
                    a.Mensaje,
                    a.FechaHora,
                    a.Activa,
                    a.FechaResolucion
                )).ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<AlertaDomain> GetById(int id)
        {
            try
            {
                var obj = await _context.Alerta
                    .Where(a => a.AlertaId == id).FirstOrDefaultAsync();

                return new AlertaDomain
                (
                    Convert.ToInt32(obj.AlertaId),
                    obj.ComunidadId,
                    obj.SensorId,
                    obj.TipoFenomenoId,
                    obj.NivelAlertaId,
                    obj.Mensaje,
                    obj.FechaHora,
                    obj.Activa,
                    obj.FechaResolucion
                );
            }
            catch (Exception)
            {
                throw;
            }
        }

        public async Task<bool> Update(AlertaDomain alerta)
        {
            try
            {
                var obj = await _context.Alerta
                    .FirstOrDefaultAsync(a => a.AlertaId == alerta.AlertaId);

                if (obj == null)
                    return false;


                //obj.AlertaId = alerta.AlertaId;
                obj.ComunidadId = alerta.ComunidadId;
                obj.SensorId = alerta.SensorId;
                obj.TipoFenomenoId = alerta.TipoFenomenoId;
                obj.NivelAlertaId = alerta.NivelAlertaId;
                obj.Mensaje = alerta.Mensaje;
                obj.FechaHora = alerta.FechaHora;
                obj.Activa = alerta.Activa;
                obj.FechaResolucion = alerta.FechaResolucion;

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
