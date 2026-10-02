using Domain.Entities.Umbral;
using Domain.Interfaces;
using Infraestructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Services.Services
{
    public class UmbralRepository : IUmbral
    {
        private readonly MonitoreoContext _context;

        public UmbralRepository(MonitoreoContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<UmbralDomain>> GetAll()
        {
            var lista = await _context.Umbrals.ToListAsync();

            return lista.Select(u => new UmbralDomain(
                u.UmbralId,
                u.TipoSensorId,
                u.ValorPrecaucion!.Value,
                u.ValorAlerta!.Value,
                u.ValorEmergencia!.Value
            )).ToList();
        }

        public async Task<UmbralDomain> GetByTipoSensor(int tipoSensorId)
        {
            var u = await _context.Umbrals
                .FirstAsync(x => x.TipoSensorId == tipoSensorId);

            return new UmbralDomain(
                u.UmbralId,
                u.TipoSensorId,
                u.ValorPrecaucion!.Value,
                u.ValorAlerta!.Value,
                u.ValorEmergencia!.Value
            );
        }

        public async Task<UmbralDomain> Update(UmbralDomain umbral)
        {
            var obj = await _context.Umbrals
                .FirstAsync(x => x.UmbralId == umbral.UmbralId);

            obj.ValorPrecaucion = umbral.ValorPrecaucion;
            obj.ValorAlerta = umbral.ValorAlerta;
            obj.ValorEmergencia = umbral.ValorEmergencia;

            await _context.SaveChangesAsync();

            return umbral;
        }
    }
}