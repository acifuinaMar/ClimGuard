using Application.RealtimeNotifier;
using Application.Simulacion;
using Infraestructure.Models;
using Microsoft.AspNetCore.SignalR;

namespace API.Hubs
{
    public class SignalRRealtimeNotifier : IRealtimeNotifier
    {
        private readonly IHubContext<MonitoreoHub> _hubContext;

        public SignalRRealtimeNotifier(
            IHubContext<MonitoreoHub> hubContext)
        {
            _hubContext = hubContext;
        }
        public async Task EnviarAlertaNuevaAsync(AlertaNuevaDto alerta, CancellationToken cancellationToken = default)
        {
            await _hubContext.Clients.All.SendAsync(
                "AlertaNueva",
                alerta,
                cancellationToken);
        }

        public async Task EnviarLecturaNuevaAsync(LecturaNuevaDto lectura, CancellationToken cancellationToken = default)
        {
            await _hubContext.Clients.All.SendAsync(
                "LecturaNueva",
                lectura,
                cancellationToken);
        }
    }
}
