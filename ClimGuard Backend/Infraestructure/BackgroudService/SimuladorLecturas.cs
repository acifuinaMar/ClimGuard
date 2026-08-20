using Application.RealtimeNotifier;
using Application.Simulacion;
using Domain.Interfaces;
using Infraestructure.Models;
using Infraestructure.Persistence;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.BackgroudService
{
    public class SimuladorLecturas : ISimuladorLecturas
    {
        private readonly MonitoreoContext _context;
        private readonly IRealtimeNotifier _notifier;
        private readonly Random _random = new();

        public SimuladorLecturas(MonitoreoContext context, IRealtimeNotifier notifier)
        {
            _context = context;
            _notifier = notifier;

        }

        public async Task GenerarLecturasAsync(CancellationToken cancellationToken)
        {
            // Obtener sensores activos
            var sensores = await _context.Sensors
                .Where(x => x.Activo)
                .ToListAsync(cancellationToken);
                

            foreach (var sensor in sensores)
            {
                // Generar valor simulado
                decimal valor = GenerarValor();

                // Crear lectura
                var lectura = new LecturaSensor
                {
                    SensorId = sensor.SensorId,
                    Valor = valor,
                    FechaHora = DateTime.Now
                };

                _context.LecturaSensors.Add(lectura);

                await _context.SaveChangesAsync(cancellationToken);

                // DTO para Angular
                var lecturaDto = new LecturaNuevaDto
                {
                    LecturaId = lectura.LecturaId,
                    SensorId = lectura.SensorId,
                    Valor = lectura.Valor,
                    FechaHora = lectura.FechaHora
                };

                // Notificar inmediatamente a Angular
                await _notifier.EnviarLecturaNuevaAsync(
                    lecturaDto,
                    cancellationToken);

                // Evaluar alerta
                await EvaluarAlertaAsync(
                    sensor,
                    valor,
                    cancellationToken);
            }
    }

        private decimal GenerarValor()
        {
            // Valor entre 0 y 100
            return Math.Round(
                (decimal)(_random.NextDouble() * 100),
                2);
        }

        private async Task EvaluarAlertaAsync(
        Sensor sensor,
        decimal valor,
        CancellationToken cancellationToken)
        {
            // Ejemplo de condición de alerta
            int tipoFenomenoId = sensor.TipoSensorId switch
            {
                1 => 4, // Temperatura -> Helada
                2 => 1, // Nivel de río -> Inundación
                3 => 1, // Lluvia -> Inundación
                4 => 3, // Viento -> Tormenta
                5 => 5, // Humedad -> Incendio Forestal
                _ => 1
            };
            if (valor < 80)
                return;

            var alerta = new Alerta
            {
                ComunidadId = sensor.ComunidadId,
                SensorId = sensor.SensorId,
                TipoFenomenoId = tipoFenomenoId,
                NivelAlertaId = 1,
                Mensaje = $"Valor crítico detectado: {valor}",
                FechaHora = DateTime.Now,
                Activa  = true               
            };

            _context.Alerta.Add(alerta);

            await _context.SaveChangesAsync(cancellationToken);

            var alertaDto = new AlertaNuevaDto
            {
                AlertaId = alerta.AlertaId,
                ComunidadId = alerta.ComunidadId,
                SensorId = alerta.SensorId,
                TipoFenomenoId = alerta.TipoFenomenoId,
                NivelAlertaId = alerta.NivelAlertaId,
                Mensaje = alerta.Mensaje,
                FechaHora = alerta.FechaHora,
                Activa = alerta.Activa
            };

            await _notifier.EnviarAlertaNuevaAsync(
                alertaDto,
                cancellationToken);
        }
    }
}
