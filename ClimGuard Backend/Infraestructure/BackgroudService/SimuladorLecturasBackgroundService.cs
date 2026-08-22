using Domain.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Infraestructure.BackgroudService
{
    public sealed class SimuladorLecturasBackgroundService : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public SimuladorLecturasBackgroundService(
            IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }


        protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();

                    var simulador =
                        scope.ServiceProvider
                            .GetRequiredService<ISimuladorLecturas>();

                    await simulador.GenerarLecturasAsync(
                        stoppingToken);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(
                        $"Error simulando lecturas: {ex.Message}");
                }

                await Task.Delay(
                    TimeSpan.FromSeconds(5),
                    stoppingToken);
            }
        }
}
}
