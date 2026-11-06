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
                    ValorDetectado = alerta.ValorDetectado,
                    MensajeSnap = alerta.MensajeSnap,
                    NivelAlertaIdSnap = alerta.NivelAlertaIdSnap,
                    TipoFenomenoIdSnap = alerta.TipoFenomenoIdSnap,
                    FechaHora = alerta.FechaHora,
                    Activo = alerta.Activo,
                    SensorId = alerta.SensorId,
                    ComunidadId = alerta.ComunidadId,
                    ReglaAlertaId = alerta.ReglaAlertaId,
                    EstadoAlertaId = alerta.EstadoAlertaId,
                    UsuarioResponsableId = alerta.UsuarioResponsableId,
                    UsuarioIng = alerta.UsuarioIng,
                    FechaIng = alerta.FechaIng,
                    UsuarioAct = alerta.UsuarioAct,
                    FechaAct = alerta.FechaAct
                };
                _context.Alerta.Add(obj);
                await _context.SaveChangesAsync();

                return new AlertaDomain(
                    alerta.AlertaId,
                    alerta.ValorDetectado,
                    alerta.MensajeSnap,
                    alerta.NivelAlertaIdSnap,
                    alerta.TipoFenomenoIdSnap,
                    alerta.FechaHora,
                    alerta.Activo,
                    alerta.SensorId,
                    alerta.ComunidadId,
                    alerta.ReglaAlertaId,
                    alerta.EstadoAlertaId,
                    alerta.UsuarioResponsableId,
                    alerta.UsuarioIng,
                    alerta.FechaIng,
                    alerta.UsuarioAct,
                    alerta.FechaAct
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
            /*var query = _context.Alerta;

            Console.WriteLine("========== SQL ==========");
            foreach (var p in _context.Model.FindEntityType(typeof(Infraestructure.Models.Alerta))!.GetProperties())
            {
                Console.WriteLine(p.Name);
            }
            Console.WriteLine(query.ToQueryString());
            Console.WriteLine("=========================");

            throw new Exception("FIN");*/
            try
            {
                var query = _context.Alerta;

               // Console.WriteLine(query.ToQueryString());

                var list = await query.ToListAsync();
                return list.Select(a => new AlertaDomain
                (
                    Convert.ToInt32(a.AlertaId),
                    a.ValorDetectado,
                    a.MensajeSnap,
                    a.NivelAlertaIdSnap,
                    a.TipoFenomenoIdSnap,
                    a.FechaHora,
                    a.Activo,
                    a.SensorId,
                    a.ComunidadId,
                    a.ReglaAlertaId,
                    a.EstadoAlertaId,
                    a.UsuarioResponsableId,
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

        public async Task<AlertaDomain> GetById(int id)
        {
            try
            {
                var obj = await _context.Alerta
                    .Where(a => a.AlertaId == id).FirstOrDefaultAsync();

                if(obj == null)
                    return null;

                return new AlertaDomain
                (
                    Convert.ToInt32(obj.AlertaId),
                    obj.ValorDetectado,
                    obj.MensajeSnap,
                    obj.NivelAlertaIdSnap,
                    obj.TipoFenomenoIdSnap,
                    obj.FechaHora,
                    obj.Activo,
                    obj.SensorId,
                    obj.ComunidadId,
                    obj.ReglaAlertaId,
                    obj.EstadoAlertaId,
                    obj.UsuarioResponsableId,
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

        public async Task<bool> Update(AlertaDomain alerta)
        {
            try
            {
                var obj = await _context.Alerta
                    .FirstOrDefaultAsync(a => a.AlertaId == alerta.AlertaId);

                if (obj == null)
                    return false;

                //obj.AlertaId = alerta.AlertaId;
                obj.ValorDetectado = alerta.ValorDetectado;
                obj.MensajeSnap = alerta.MensajeSnap;
                obj.NivelAlertaIdSnap = alerta.NivelAlertaIdSnap;
                obj.TipoFenomenoIdSnap = alerta.TipoFenomenoIdSnap;
                obj.FechaHora = alerta.FechaHora;
                obj.Activo = alerta.Activo;
                obj.SensorId = alerta.SensorId;
                obj.ComunidadId = alerta.ComunidadId;
                obj.ReglaAlertaId = alerta.ReglaAlertaId;
                obj.EstadoAlertaId = alerta.EstadoAlertaId;
                obj.UsuarioResponsableId = alerta.UsuarioResponsableId;

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
