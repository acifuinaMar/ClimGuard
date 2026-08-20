using Application.JWT;
using Domain.Interfaces;
using Infraestructure.BackgroudService;
using Infraestructure.Persistence;
using Infraestructure.Repositories;
using Infraestructure.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Services.Services;
using Services.Services.Interfaces;
using tickets.Application.Common.UnitOfWork;

namespace Infraestructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection service, IConfiguration configuration)
        {
            service.AddDbContext<MonitoreoContext>(options =>
            {
                options.UseSqlServer(configuration.GetConnectionString("connection"));
            });

            service.AddScoped<IUnitOfWork, UnitofWork>();
            service.AddScoped<IUsuario, UsuarioRepository>();
            service.AddScoped<ISensor, SensorRepository>();
            service.AddScoped<IComunidad, ComunidadRepository>();
            service.AddScoped<IAlerta, AlertaRespository>();
            service.AddScoped<ILogin, LoginRepository>();
            service.AddScoped<ILecturaSensor, LecturaSensorRepository>();
            service.AddScoped<IBitacora, BitacoraRepository>();
            service.AddScoped<TokenService>();

            service.AddScoped<ISimuladorLecturas, SimuladorLecturas>();
            service.AddHostedService<SimuladorLecturasBackgroundService>();
            return service;
        }
    }
}
