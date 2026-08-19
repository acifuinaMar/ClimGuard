using Application.Common.Behavior;
using Application.Common.Encrypt;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            //inject mediatr
            services.AddMediatR(config =>
            {
                config.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            });
            services.AddScoped<EncryptPassword>();
            services.AddTransient(
                typeof(IPipelineBehavior<,>),
                typeof(Behaviors<,>)
                );

            return services;
        }
    }
}
