using Domain.Entities.ReglaAlerta;
using Domain.Interfaces;
using Infraestructure.Models;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Services.Services
{
    public class ReglaAlertaRepository : IReglaAlerta
    {
        private readonly MonitoreoContext _context;

        public ReglaAlertaRepository(MonitoreoContext context)
        {
            _context = context;
        }

        public async Task<ReglaAlertaDomain> Create(ReglaAlertaDomain reglaAlerta)
        {
            try
            {
                var obj = new ReglaAlerta
                {
                    ReglaAlertaId = reglaAlerta.ReglaAlertaId,
                    Nombre = reglaAlerta.Nombre,
                    ValorMin = reglaAlerta.ValorMin,
                    ValorMax = reglaAlerta.ValorMax,
                    Mensaje = reglaAlerta.Mensaje,
                    Activo = reglaAlerta.Activo,
                    TipoSensorId = reglaAlerta.TipoSensorId,
                    TipoFenomenoId = reglaAlerta.TipoFenomenoId,
                    NivelAlertaId = reglaAlerta.NivelAlertaId,
                    UsuarioIng = reglaAlerta.UsuarioIng,
                    FechaIng = reglaAlerta.FechaIng,
                    UsuarioAct = reglaAlerta.UsuarioAct,
                    FechaAct = reglaAlerta.FechaAct
                };
                _context.ReglaAlertas.Add(obj);
                await _context.SaveChangesAsync();

                return new ReglaAlertaDomain(
                    obj.ReglaAlertaId,
                    obj.Nombre,
                    obj.ValorMin,
                    obj.ValorMax,
                    obj.Mensaje,
                    obj.Activo,
                    obj.TipoSensorId,
                    obj.TipoFenomenoId,
                    obj.NivelAlertaId,
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

        public async Task<bool> Delete(ReglaAlertaDomain reglaAlerta)
        {
            var obj = await _context.ReglaAlertas
                .FirstOrDefaultAsync(a => a.ReglaAlertaId == reglaAlerta.ReglaAlertaId);

            if (obj == null)
                return false;

            _context.ReglaAlertas.Remove(obj);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<IReadOnlyList<ReglaAlertaDomain>> GetAll()
        {
            var lista = await _context.ReglaAlertas.ToListAsync();

            return lista.Select(r => new ReglaAlertaDomain(
                r.ReglaAlertaId,
                r.Nombre,
                r.ValorMin,
                r.ValorMax,
                r.Mensaje,
                r.Activo,
                r.TipoSensorId,
                r.TipoFenomenoId,
                r.NivelAlertaId,
                r.UsuarioIng,
                r.FechaIng,
                r.UsuarioAct,
                r.FechaAct
            )).ToList();
        }

        public async Task<ReglaAlertaDomain?> GetById(int reglaAlertaId)
        {
            var r = await _context.ReglaAlertas
                .FirstOrDefaultAsync(x => x.ReglaAlertaId == reglaAlertaId);

            if (r == null)
                return null;

            return new ReglaAlertaDomain(
                r.ReglaAlertaId,
                r.Nombre,
                r.ValorMin,
                r.ValorMax,
                r.Mensaje,
                r.Activo,
                r.TipoSensorId,
                r.TipoFenomenoId,
                r.NivelAlertaId,
                r.UsuarioIng,
                r.FechaIng,
                r.UsuarioAct,
                r.FechaAct
            );
        }

        public async Task<ReglaAlertaDomain> GetByTipoSensor(int tipoSensorId)
        {
            var r = await _context.ReglaAlertas
                .FirstOrDefaultAsync(x => x.TipoSensorId == tipoSensorId);
            
            if (r == null)
                return null;

            return new ReglaAlertaDomain(
                r.ReglaAlertaId,
                r.Nombre,
                r.ValorMin,
                r.ValorMax,
                r.Mensaje,
                r.Activo,
                r.TipoSensorId,
                r.TipoFenomenoId,
                r.NivelAlertaId,
                r.UsuarioIng,
                r.FechaIng,
                r.UsuarioAct,
                r.FechaAct
            );
        }

        public async Task<ReglaAlertaDomain> Update(ReglaAlertaDomain regla)
        {
            var obj = await _context.ReglaAlertas
                .FirstOrDefaultAsync(x => x.ReglaAlertaId == regla.ReglaAlertaId);

            if (obj == null)
                throw new InvalidOperationException("Regla de alerta no encontrada");

            obj.ReglaAlertaId = regla.ReglaAlertaId;
            obj.Nombre = regla.Nombre;
            obj.ValorMin = regla.ValorMin;
            obj.ValorMax = regla.ValorMax;
            obj.Mensaje = regla.Mensaje;
            obj.Activo = regla.Activo;  
            obj.TipoSensorId = regla.TipoSensorId;
            obj.TipoFenomenoId = regla.TipoFenomenoId;
            obj.NivelAlertaId = regla.NivelAlertaId;
            obj.UsuarioIng = regla.UsuarioIng;
            obj.FechaIng = regla.FechaIng;
            obj.UsuarioAct = regla.UsuarioAct;
            obj.FechaAct = regla.FechaAct;

            await _context.SaveChangesAsync();

            return regla;
        }
    }
}