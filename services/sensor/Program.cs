using System.Security.Claims;
using System.Text;
using ClimGuard.Sensor;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
string Req(string k) => builder.Configuration[k] is { Length: > 0 } v ? v : throw new InvalidOperationException($"Falta configuración: {k}");

var jwtKey = Req("Jwt:Key");
if (Encoding.UTF8.GetByteCount(jwtKey) < 32) throw new InvalidOperationException("Jwt:Key debe tener al menos 32 bytes");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(o =>
{
    o.MapInboundClaims = false;
    o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, ValidIssuer = Req("Jwt:Issuer"),
        ValidateAudience = true, ValidAudience = Req("Jwt:Audience"),
        ValidateIssuerSigningKey = true, IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateLifetime = true, RequireExpirationTime = true, ClockSkew = TimeSpan.FromSeconds(30),
        ValidAlgorithms = new[] { SecurityAlgorithms.HmacSha256 },
        RoleClaimType = "role", NameClaimType = "preferred_username"
    };
    o.Events = new JwtBearerEvents
    {
        OnMessageReceived = c =>
        {
            var t = c.Request.Query["access_token"];
            if (!string.IsNullOrEmpty(t) && c.HttpContext.Request.Path.StartsWithSegments("/hubs")) c.Token = t;
            return Task.CompletedTask;
        }
    };
});
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("admin", p => p.RequireAuthenticatedUser().RequireRole("Administrador"))
    .AddPolicy("operator", p => p.RequireAuthenticatedUser().RequireRole("Administrador", "Operador"))
    .AddPolicy("user", p => p.RequireAuthenticatedUser());

builder.Services.AddDbContext<SensorDb>(o => o.UseSqlServer(Req("ConnectionStrings:Default"), s => s.EnableRetryOnFailure(5)));
builder.Services.AddHttpClient("alert", c => { c.BaseAddress = new Uri(builder.Configuration["Services:Alert"] ?? "http://alert-service:8080/"); c.Timeout = TimeSpan.FromSeconds(4); });
builder.Services.AddHttpClient("community", c => { c.BaseAddress = new Uri(builder.Configuration["Services:Community"] ?? "http://community-service:8080/"); c.Timeout = TimeSpan.FromSeconds(5); });
builder.Services.AddSignalR();
builder.Services.AddSingleton(new SimulationState { Enabled = builder.Configuration.GetValue("Simulator:Enabled", false) });
builder.Services.AddSingleton<ReadingPipeline>();
builder.Services.AddHostedService<Simulator>();
var origins = (builder.Configuration["Cors:Origins"] ?? "http://localhost:4200").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials()));
builder.Services.Configure<HostOptions>(o => o.ShutdownTimeout = TimeSpan.FromSeconds(25));

var app = builder.Build();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<SensorDb>();
    for (var i = 1; ; i++)
    {
        try { await db.Database.EnsureCreatedAsync(); break; }
        catch (Exception ex) when (i < 20)
        {
            app.Logger.LogWarning(ex,
                "Error inicializando SQL Server (intento {N}/20)", i);
            await Task.Delay(3000);
        }
    }
    if (!await db.SensorTypes.AnyAsync())
    {
        db.SensorTypes.AddRange(new[] { ("Temperatura", "°C"), ("Humedad", "%"), ("Velocidad del viento", "km/h"), ("Lluvia", "mm"), ("Nivel de río", "m"), ("Nivel de reservorio", "m"), ("Humo / Incendio", "ppm"), ("Otro", "-") }
            .Select(t => new SensorType { Nombre = t.Item1, UnidadMedida = t.Item2 }));
        db.SensorStates.AddRange(new[] { "Activo", "Inactivo", "Mantenimiento", "Fuera de línea" }.Select(n => new SensorState { Nombre = n }));
        await db.SaveChangesAsync();
    }
    if (builder.Configuration.GetValue<bool>("Seed:Demo") && !await db.Sensors.AnyAsync())
    {
        var now = DateTime.UtcNow;
        db.Sensors.AddRange(
            new Sensor { Nombre = "Temperatura San Juan", Codigo = "TMP-001", Ubicacion = "Plaza central", Descripcion = "Sensor de temperatura ambiente", FechaInstalacion = now.AddMonths(-6), FechaUltimaConexion = now, ComunidadId = 1, TipoSensorId = 1, EstadoSensorId = 1, UsuarioIng = 1 },
            new Sensor { Nombre = "Lluvia San Juan", Codigo = "LLV-001", Ubicacion = "Cerro norte", Descripcion = "Pluviómetro", FechaInstalacion = now.AddMonths(-6), FechaUltimaConexion = now, ComunidadId = 1, TipoSensorId = 4, EstadoSensorId = 1, UsuarioIng = 1 },
            new Sensor { Nombre = "Nivel lago Panajachel", Codigo = "NVL-001", Ubicacion = "Muelle", Descripcion = "Nivel de agua del lago", FechaInstalacion = now.AddMonths(-3), FechaUltimaConexion = now, ComunidadId = 2, TipoSensorId = 5, EstadoSensorId = 1, UsuarioIng = 1 });
        await db.SaveChangesAsync();
    }
}

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapGet("/ready", async (SensorDb db) => await db.Database.CanConnectAsync() ? Results.Ok(new { status = "ready" }) : Results.StatusCode(503));
app.MapHub<MonitoreoHub>("/hubs/monitoreo").RequireAuthorization("user");

static (int page, int size) Page(int page, int size, int max = 1000) => (Math.Max(1, page), Math.Clamp(size, 1, max));

// ---- Catálogos ----
app.MapGet("/api/sensor-types", async (SensorDb db) => Results.Ok(await db.SensorTypes.AsNoTracking().OrderBy(t => t.TipoSensorId).ToListAsync())).RequireAuthorization("user");
app.MapGet("/api/sensor-states", async (SensorDb db) => Results.Ok(await db.SensorStates.AsNoTracking().OrderBy(t => t.EstadoSensorId).ToListAsync())).RequireAuthorization("user");

// ---- Sensores ----
var sg = app.MapGroup("/api/sensors");
sg.MapGet("", async (SensorDb db, HttpResponse res, int? comunidadId, int? tipoSensorId, int? estadoSensorId, int page = 1, int pageSize = 100) =>
{
    (page, pageSize) = Page(page, pageSize);
    var q = db.Sensors.AsNoTracking().AsQueryable();
    if (comunidadId is not null) q = q.Where(s => s.ComunidadId == comunidadId);
    if (tipoSensorId is not null) q = q.Where(s => s.TipoSensorId == tipoSensorId);
    if (estadoSensorId is not null) q = q.Where(s => s.EstadoSensorId == estadoSensorId);
    res.Headers["X-Total-Count"] = (await q.CountAsync()).ToString();
    return Results.Ok((await q.OrderBy(s => s.SensorId).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync()).Select(SensorDto.From));
}).RequireAuthorization("user");

sg.MapGet("/{id:int}", async (int id, SensorDb db) =>
    await db.Sensors.AsNoTracking().FirstOrDefaultAsync(s => s.SensorId == id) is { } s ? Results.Ok(SensorDto.From(s)) : Results.NotFound()).RequireAuthorization("user");

// La comunidad pertenece a otro servicio: se valida por su API, nunca por su BD (§16).
static async Task<IResult?> CheckRefs(SensorInput i, SensorDb db, IHttpClientFactory hf, HttpContext ctx)
{
    if (i.Validate() is { } err) return Results.BadRequest(new { detail = err });
    if (!await db.SensorTypes.AnyAsync(t => t.TipoSensorId == i.TipoSensorId)) return Results.BadRequest(new { detail = "Tipo de sensor inválido" });
    if (!await db.SensorStates.AnyAsync(t => t.EstadoSensorId == i.EstadoSensorId)) return Results.BadRequest(new { detail = "Estado de sensor inválido" });
    try
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, $"api/communities/{i.ComunidadId}");
        req.Headers.Authorization = System.Net.Http.Headers.AuthenticationHeaderValue.Parse(ctx.Request.Headers.Authorization.ToString());
        using var resp = await hf.CreateClient("community").SendAsync(req, ctx.RequestAborted);
        if (resp.StatusCode == System.Net.HttpStatusCode.NotFound) return Results.BadRequest(new { detail = "La comunidad no existe" });
        if (!resp.IsSuccessStatusCode) return Results.Json(new { detail = "No se pudo validar la comunidad" }, statusCode: 503);
    }
    catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
    { return Results.Json(new { detail = "Servicio de comunidades no disponible" }, statusCode: 503); }
    return null;
}

sg.MapPost("", async (SensorInput i, ClaimsPrincipal u, SensorDb db, IHttpClientFactory hf, HttpContext ctx) =>
{
    if (await CheckRefs(i, db, hf, ctx) is { } bad) return bad;
    var code = i.Codigo!.Trim();
    if (await db.Sensors.AnyAsync(s => s.Codigo == code)) return Results.Conflict(new { detail = "El código ya existe" });
    var now = DateTime.UtcNow;
    var s = new Sensor { Nombre = i.Nombre!.Trim(), Codigo = code, Ubicacion = i.Ubicacion!.Trim(), Descripcion = i.Descripcion?.Trim() ?? "",
        FechaInstalacion = i.FechaInstalacion ?? now, FechaUltimaConexion = now, ComunidadId = i.ComunidadId, TipoSensorId = i.TipoSensorId,
        EstadoSensorId = i.EstadoSensorId, UsuarioIng = u.UserId() };
    db.Sensors.Add(s); await db.SaveChangesAsync();
    return Results.Created($"/api/sensors/{s.SensorId}", SensorDto.From(s));
}).RequireAuthorization("admin");

sg.MapPut("/{id:int}", async (int id, SensorInput i, ClaimsPrincipal u, SensorDb db, IHttpClientFactory hf, HttpContext ctx) =>
{
    if (await CheckRefs(i, db, hf, ctx) is { } bad) return bad;
    var s = await db.Sensors.FindAsync(id);
    if (s is null) return Results.NotFound();
    var code = i.Codigo!.Trim();
    if (await db.Sensors.AnyAsync(x => x.Codigo == code && x.SensorId != id)) return Results.Conflict(new { detail = "El código ya existe" });
    s.Nombre = i.Nombre!.Trim(); s.Codigo = code; s.Ubicacion = i.Ubicacion!.Trim(); s.Descripcion = i.Descripcion?.Trim() ?? "";
    if (i.FechaInstalacion is { } fi) s.FechaInstalacion = fi;
    s.ComunidadId = i.ComunidadId; s.TipoSensorId = i.TipoSensorId; s.EstadoSensorId = i.EstadoSensorId;
    s.UsuarioAct = u.UserId(); s.FechaAct = DateTime.UtcNow;
    await db.SaveChangesAsync();
    return Results.Ok(SensorDto.From(s));
}).RequireAuthorization("admin");

sg.MapDelete("/{id:int}", async (int id, SensorDb db) =>
{
    var s = await db.Sensors.FindAsync(id);
    if (s is null) return Results.NotFound();
    db.Sensors.Remove(s); await db.SaveChangesAsync();   // lecturas en cascada
    return Results.NoContent();
}).RequireAuthorization("admin");

// ---- Lecturas ----
var rg = app.MapGroup("/api/readings");
rg.MapGet("", async (SensorDb db, HttpResponse res, int? sensorId, int? comunidadId, int? tipoSensorId, DateTime? desde, DateTime? hasta, int page = 1, int pageSize = 500) =>
{
    (page, pageSize) = Page(page, pageSize);
    var q = db.Readings.AsNoTracking().AsQueryable();
    if (sensorId is not null) q = q.Where(r => r.SensorId == sensorId);
    if (comunidadId is not null || tipoSensorId is not null)
        q = q.Where(r => db.Sensors.Any(s => s.SensorId == r.SensorId && (comunidadId == null || s.ComunidadId == comunidadId) && (tipoSensorId == null || s.TipoSensorId == tipoSensorId)));
    if (desde is not null) q = q.Where(r => r.FechaHora >= desde.Value.ToUniversalTime());
    if (hasta is not null) q = q.Where(r => r.FechaHora <= hasta.Value.ToUniversalTime());
    res.Headers["X-Total-Count"] = (await q.CountAsync()).ToString();
    return Results.Ok((await q.OrderByDescending(r => r.FechaHora).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync()).Select(ReadingDto.From));
}).RequireAuthorization("user");

rg.MapGet("/stats", async (SensorDb db, int? comunidadId, DateTime? desde, DateTime? hasta) =>
{
    var q = db.Readings.AsNoTracking().Join(db.Sensors, r => r.SensorId, s => s.SensorId, (r, s) => new { r, s });
    if (comunidadId is not null) q = q.Where(x => x.s.ComunidadId == comunidadId);
    if (desde is not null) q = q.Where(x => x.r.FechaHora >= desde.Value.ToUniversalTime());
    if (hasta is not null) q = q.Where(x => x.r.FechaHora <= hasta.Value.ToUniversalTime());
    var rows = await q.GroupBy(x => x.s.TipoSensorId)
        .Select(g => new StatRow(g.Key, g.Count(), g.Average(x => x.r.Valor), g.Min(x => x.r.Valor), g.Max(x => x.r.Valor), g.Sum(x => x.r.Valor)))
        .OrderBy(x => x.TipoSensorId).ToListAsync();
    return Results.Ok(rows);
}).RequireAuthorization("user");

rg.MapPost("", async (ReadingInput i, ClaimsPrincipal u, ReadingPipeline p, CancellationToken ct) =>
{
    var r = await p.RecordAsync(i.SensorId, i.Valor, i.FechaHora, u.UserId(), ct);
    return r is null ? Results.NotFound(new { detail = "Sensor no existe" }) : Results.Created($"/api/readings/{r.LecturaId}", ReadingDto.From(r));
}).RequireAuthorization("operator");

// ---- Simulación (apagada por defecto; sin estado persistente: solo para demo) ----
var sim = app.MapGroup("/api/simulation");
sim.MapGet("", (SimulationState s) => Results.Ok(new { enabled = s.Enabled })).RequireAuthorization("user");
sim.MapPost("/start", (SimulationState s) => { s.Enabled = true; return Results.Ok(new { enabled = true }); }).RequireAuthorization("admin");
sim.MapPost("/stop", (SimulationState s) => { s.Enabled = false; return Results.Ok(new { enabled = false }); }).RequireAuthorization("admin");

app.Run();
