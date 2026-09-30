using Domain.Entities.ReglaAlerta;
using Domain.Interfaces;
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
                r.NivelAlertaId
            )).ToList();
        }

        public async Task<ReglaAlertaDomain> GetById(int reglaAlertaId)
        {
            var r = await _context.ReglaAlertas
                .FirstAsync(x => x.ReglaAlertaId == reglaAlertaId);

            return new ReglaAlertaDomain(
                r.ReglaAlertaId,
                r.Nombre,
                r.ValorMin,
                r.ValorMax,
                r.Mensaje,
                r.Activo,
                r.TipoSensorId,
                r.TipoFenomenoId,
                r.NivelAlertaId
            );
        }

        public async Task<ReglaAlertaDomain> GetByTipoSensor(int tipoSensorId)
        {
            var r = await _context.ReglaAlertas
                .FirstAsync(x => x.TipoSensorId == tipoSensorId);

            return new ReglaAlertaDomain(
                r.ReglaAlertaId,
                r.Nombre,
                r.ValorMin,
                r.ValorMax,
                r.Mensaje,
                r.Activo,
                r.TipoSensorId,
                r.TipoFenomenoId,
                r.NivelAlertaId
            );
        }

        public async Task<ReglaAlertaDomain> Update(ReglaAlertaDomain regla)
        {
            var obj = await _context.ReglaAlertas
                .FirstAsync(x => x.ReglaAlertaId == regla.ReglaAlertaId);

            obj.Nombre = regla.Nombre;
            obj.ValorMin = regla.ValorMin;
            obj.ValorMax = regla.ValorMax;
            obj.Mensaje = regla.Mensaje;
            obj.Activo = regla.Activo;
            obj.TipoSensorId = regla.TipoSensorId;
            obj.TipoFenomenoId = regla.TipoFenomenoId;
            obj.NivelAlertaId = regla.NivelAlertaId;

            await _context.SaveChangesAsync();

            return regla;
        }
    }
}