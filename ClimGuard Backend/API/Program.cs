using Microsoft.OpenApi;
using Application;
using Infraestructure;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configuración de CORS permisivo (Cualquier origen, método y encabezado)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Inject the dependency
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
//========================================================================//
builder.Services.AddEndpointsApiExplorer();

// OpenAPI
builder.Services.AddOpenApi();

// Swagger
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Mi API",
        Version = "v1",
        Description = "API desarrollada con .NET 10"
    });
});
//========================================================================//
builder.Services.AddMediatR(config =>
{
    config.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
});

var app = builder.Build();

// OpenAPI JSON
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    // Swagger JSON + Swagger UI
    app.UseSwagger();

    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Mi API v1");
        options.RoutePrefix = "swagger";
    });
}

// Activar el middleware de CORS antes de autorización y controladores
app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
