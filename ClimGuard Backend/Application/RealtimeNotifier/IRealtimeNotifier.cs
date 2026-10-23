using Application.Simulacion;

namespace Application.RealtimeNotifier
{
    public interface IRealtimeNotifier
    {
        Task EnviarLecturaNuevaAsync(
            LecturaNuevaDto lectura,
            CancellationToken cancellationToken = default);

        Task EnviarAlertaNuevaAsync(
            AlertaNuevaDto alerta,
            CancellationToken cancellationToken = default);
    }
}
