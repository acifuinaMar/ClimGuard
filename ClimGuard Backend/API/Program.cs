using API.Hubs;
using Application;
using Application.RealtimeNotifier;
using Infraestructure;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var miorigen = builder.Configuration["Origin:miorigen"]!;

// Add services to the container.
builder.Services.AddControllers();

// Configuración de CORS permisivo (Cualquier origen, método y encabezado)
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowAll", policy =>
//    {
//        policy.AllowAnyOrigin()
//              .AllowAnyMethod()
//              .AllowAnyHeader();
//    });
//});

//Origen de tu frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: miorigen,
        policy =>
        {
            policy.WithOrigins(builder.Configuration["OriginAllowed:originAllowe"]!) // el origen de tu frontend
                  .AllowAnyMethod()
                  .AllowAnyHeader();
            //.AllowCredentials(); // si se usa cookies o SignalR
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

//================================JWT Configurations==============================//

/*agrega servicios de autenticacion*/
builder.Services.AddAuthentication(config =>
{
    config.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    config.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(config =>/*configuracion jwt)*/
{
    config.RequireHttpsMetadata = false; /*cambiar a true cuando va a produccion*/
    config.SaveToken = true; /*guarda el token despues de una autenticacion exitosa*/

    /*define como se valida el jwt*/
    config.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,/*valida que el token no haya expirado*/
        ClockSkew = TimeSpan.FromMinutes(1),/*elimina el margen de tolerancia de tiempo (default 5 minutes)*/

        /*define la clave secreta para validar la firma del token*/
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:key"]!))
    };
});
//================================================================================//

//Signal
builder.Services.AddSignalR();
builder.Services.AddScoped<IRealtimeNotifier, SignalRRealtimeNotifier>();
//MediaTr
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
app.UseCors(miorigen);

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<MonitoreoHub>("/hubs/monitoreo");

app.Run();
