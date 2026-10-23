using System.Net.Http.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace ClimGuard.Sensor;

public class MonitoreoHub : Hub { }

public record AlertEvaluation(bool Generated, JsonAlert? Alert);
public record JsonAlert(int AlertaId, int ComunidadId, int SensorId, int TipoFenomenoIdSnap, int NivelAlertaIdSnap, string MensajeSnap, DateTime FechaHora, bool Activo);

/// <summary>Guarda la lectura, la evalúa en Alert Service (por API) y la difunde por SignalR.</summary>
public class ReadingPipeline(IServiceScopeFactory scopes, IHttpClientFactory http, IHubContext<MonitoreoHub> hub, IConfiguration cfg, ILogger<ReadingPipeline> log)
{
    public async Task<Reading?> RecordAsync(int sensorId, decimal valor, DateTime? at, int userId, CancellationToken ct)
    {
        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SensorDb>();
        var sensor = await db.Sensors.FindAsync([sensorId], ct);
        if (sensor is null) return null;
        var when = at?.ToUniversalTime() ?? DateTime.UtcNow;
        var r = new Reading { SensorId = sensorId, Valor = valor, FechaHora = when, UsuarioIng = userId };
        db.Readings.Add(r);
        sensor.ValorActual = valor; sensor.FechaUltimaConexion = when;
        await db.SaveChangesAsync(ct);

        await hub.Clients.All.SendAsync("LecturaNueva", new { lecturaId = r.LecturaId, sensorId, valor, fechaHora = when }, ct);
        try
        {
            using var req = new HttpRequestMessage(HttpMethod.Post, "api/alerts/evaluate")
            { Content = JsonContent.Create(new { sensorId, comunidadId = sensor.ComunidadId, tipoSensorId = sensor.TipoSensorId, valor, fechaHora = when }) };
            req.Headers.Add("X-Internal-Key", cfg["InternalApiKey"] ?? "");
            using var resp = await http.CreateClient("alert").SendAsync(req, ct);
            if (resp.IsSuccessStatusCode && resp.StatusCode != System.Net.HttpStatusCode.NoContent)
            {
                var ev = await resp.Content.ReadFromJsonAsync<AlertEvaluation>(new System.Text.Json.JsonSerializerOptions(System.Text.Json.JsonSerializerDefaults.Web), ct);
                if (ev?.Generated == true && ev.Alert is { } a) await hub.Clients.All.SendAsync("AlertaNueva", a, ct);
            }
            else if (!resp.IsSuccessStatusCode) log.LogWarning("Alert Service respondió {S} al evaluar la lectura", (int)resp.StatusCode);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            log.LogWarning("Alert Service no disponible; la lectura {Id} queda sin evaluar", r.LecturaId);
        }
        return r;
    }
}

public class SimulationState { public volatile bool Enabled; }

public class Simulator(IServiceScopeFactory scopes, ReadingPipeline pipeline, SimulationState state, IConfiguration cfg, ILogger<Simulator> log) : BackgroundService
{
    private readonly Random _rnd = new();
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        var every = TimeSpan.FromSeconds(Math.Max(1, cfg.GetValue("Simulator:IntervalSeconds", 5)));
        using var timer = new PeriodicTimer(every);
        try
        {
            while (await timer.WaitForNextTickAsync(ct))
            {
                if (!state.Enabled) continue;
                try
                {
                    List<int> ids;
                    using (var scope = scopes.CreateScope())
                        ids = await scope.ServiceProvider.GetRequiredService<SensorDb>().Sensors.AsNoTracking()
                            .Where(s => s.EstadoSensorId == 1).Select(s => s.SensorId).ToListAsync(ct);
                    foreach (var id in ids)
                        await pipeline.RecordAsync(id, Math.Round((decimal)(_rnd.NextDouble() * 100), 2), null, 1, ct);
                }
                catch (Exception ex) when (ex is not OperationCanceledException) { log.LogWarning("Ciclo de simulación falló: {E}", ex.Message); }
            }
        }
        catch (OperationCanceledException) { /* apagado ordenado */ }
    }
}
