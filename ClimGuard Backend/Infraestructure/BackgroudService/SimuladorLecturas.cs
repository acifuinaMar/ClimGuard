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
        private readonly IUmbral _umbralRepository;
        private readonly Random _random = new();

        public SimuladorLecturas(
    MonitoreoContext context,
    IRealtimeNotifier notifier,
    IUmbral umbralRepository)
        {
            _context = context;
            _notifier = notifier;
            _umbralRepository = umbralRepository;
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
            // Obtener los umbrales configurados para este tipo de sensor
            var umbral = await _umbralRepository.GetByTipoSensor(sensor.TipoSensorId);

            // Determinar el nivel según los umbrales configurados
            int nivelAlertaId;

            if (valor >= umbral.ValorEmergencia)
            {
                nivelAlertaId = 4; // Rojo
            }
            else if (valor >= umbral.ValorAlerta)
            {
                nivelAlertaId = 3; // Naranja
            }
            else if (valor >= umbral.ValorPrecaucion)
            {
                nivelAlertaId = 2; // Amarillo
            }
            else
            {
                // No supera el umbral de precaución
                return;
            }

            // Determinar el fenómeno asociado al tipo de sensor
            int tipoFenomenoId = sensor.TipoSensorId switch
            {
                1 => 5, // Temperatura -> Incendio Forestal
                2 => 2, // Humedad -> Sequía
                3 => 3, // Viento -> Tormenta
                4 => 1, // Lluvia -> Inundación
                5 => 1, // Nivel del Río -> Inundación
                _ => 1
            };

            // Construir un mensaje descriptivo
            string mensaje = sensor.TipoSensorId switch
            {
                1 => $"Temperatura de {valor:F2} °C. Existe riesgo de incendio forestal.",

                2 => $"Humedad de {valor:F2} %. Existe riesgo de sequía.",

                3 => $"Velocidad del viento de {valor:F2} km/h. Existe riesgo de tormenta.",

                4 => $"Lluvia acumulada de {valor:F2} mm. Existe riesgo de inundación.",

                5 => $"Nivel del río de {valor:F2} m. Existe riesgo de desbordamiento.",

                _ => $"Valor crítico detectado: {valor:F2}"
            };

            // Crear la alerta
            var alerta = new Alerta
            {
                ComunidadId = sensor.ComunidadId,
                SensorId = sensor.SensorId,
                TipoFenomenoId = tipoFenomenoId,
                NivelAlertaId = nivelAlertaId,
                Mensaje = mensaje,
                FechaHora = DateTime.Now,
                Activa = true
            };

            _context.Alerta.Add(alerta);

            await _context.SaveChangesAsync(cancellationToken);

            // Notificar por SignalR
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
