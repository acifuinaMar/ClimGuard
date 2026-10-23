using System.Security.Claims;
using System.Text;
using ClimGuard.Community;
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
});
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("admin", p => p.RequireAuthenticatedUser().RequireRole("Administrador"))
    .AddPolicy("user", p => p.RequireAuthenticatedUser());

builder.Services.AddDbContext<CommunityDb>(o => o.UseNpgsql(Req("ConnectionStrings:Default")));
builder.Services.AddHttpClient("sensor", c =>
{
    c.BaseAddress = new Uri(builder.Configuration["Services:Sensor"] ?? "http://sensor-service:8080/");
    c.Timeout = TimeSpan.FromSeconds(10);
});
builder.Services.AddHttpClient("audit", c =>
{
    c.BaseAddress = new Uri(builder.Configuration["Services:Audit"] ?? "http://audit-service:8000/");
    c.Timeout = TimeSpan.FromSeconds(3);
});
builder.Services.AddSingleton<AuditEmitter>();
builder.Services.Configure<HostOptions>(o => o.ShutdownTimeout = TimeSpan.FromSeconds(25));

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();

// Esquema + datos demo (con reintentos: Postgres puede tardar en arrancar)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<CommunityDb>();
    for (var i = 1; ; i++)
    {
        try { await db.Database.EnsureCreatedAsync(); break; }
        catch (Exception ex) when (i < 15) { app.Logger.LogWarning("BD no lista ({N}/15): {M}", i, ex.GetType().Name); await Task.Delay(3000); }
    }
    if (builder.Configuration.GetValue<bool>("Seed:Demo") && !await db.Communities.AnyAsync())
    {
        db.Communities.AddRange(
            new Community { NombreComunidad = "San Juan Sacatepéquez", Descripcion = "Zona de ladera con riesgo de deslizamiento", Pais = "Guatemala", Departamento = "Guatemala", Municipio = "San Juan Sacatepéquez", Latitud = 14.7167m, Longitud = -90.6411m, Activo = true, UsuarioIng = 1 },
            new Community { NombreComunidad = "Panajachel", Descripcion = "Ribera del Lago de Atitlán", Pais = "Guatemala", Departamento = "Sololá", Municipio = "Panajachel", Latitud = 14.7406m, Longitud = -91.1589m, Activo = true, UsuarioIng = 1 },
            new Community { NombreComunidad = "Escuintla Centro", Descripcion = "Zona costera, lluvias intensas", Pais = "Guatemala", Departamento = "Escuintla", Municipio = "Escuintla", Latitud = 14.3050m, Longitud = -90.7850m, Activo = true, UsuarioIng = 1 });
        await db.SaveChangesAsync();
    }
}

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));
app.MapGet("/ready", async (CommunityDb db) => await db.Database.CanConnectAsync() ? Results.Ok(new { status = "ready" }) : Results.StatusCode(503));

var g = app.MapGroup("/api/communities");

g.MapGet("", async (CommunityDb db, HttpResponse res, bool? activo, string? q, int page = 1, int pageSize = 100) =>
{
    page = Math.Max(1, page); pageSize = Math.Clamp(pageSize, 1, 1000);
    IQueryable<Community> query = db.Communities.AsNoTracking();
    if (activo is not null) query = query.Where(c => c.Activo == activo);
    if (!string.IsNullOrWhiteSpace(q)) query = query.Where(c => EF.Functions.ILike(c.NombreComunidad, $"%{q.Trim()}%"));
    res.Headers["X-Total-Count"] = (await query.CountAsync()).ToString();
    var items = await query.OrderBy(c => c.ComunidadId).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
    return Results.Ok(items.Select(CommunityDto.From));
}).RequireAuthorization("user");

g.MapGet("/{id:int}", async (int id, CommunityDb db) =>
    await db.Communities.AsNoTracking().FirstOrDefaultAsync(c => c.ComunidadId == id) is { } c
        ? Results.Ok(CommunityDto.From(c)) : Results.NotFound()).RequireAuthorization("user");

g.MapPost("", async (CommunityInput i, ClaimsPrincipal u, CommunityDb db, AuditEmitter audit) =>
{
    if (i.Validate() is { } err) return Results.BadRequest(new { detail = err });
    var c = new Community { UsuarioIng = u.UserId() };
    i.ApplyTo(c);
    db.Communities.Add(c);
    await db.SaveChangesAsync();
    audit.Emit(u, "COMMUNITY_CREATED", "Comunidad", new { id = c.ComunidadId, descripcion = $"Comunidad {c.NombreComunidad} creada" });
    return Results.Created($"/api/communities/{c.ComunidadId}", CommunityDto.From(c));
}).RequireAuthorization("admin");

g.MapPut("/{id:int}", async (int id, CommunityInput i, ClaimsPrincipal u, CommunityDb db, AuditEmitter audit) =>
{
    if (i.Validate() is { } err) return Results.BadRequest(new { detail = err });
    var c = await db.Communities.FindAsync(id);
    if (c is null) return Results.NotFound();
    i.ApplyTo(c); c.UsuarioAct = u.UserId(); c.FechaAct = DateTime.UtcNow;
    await db.SaveChangesAsync();
    audit.Emit(u, "COMMUNITY_UPDATED", "Comunidad", new { id, descripcion = $"Comunidad {c.NombreComunidad} actualizada" });
    return Results.Ok(CommunityDto.From(c));
}).RequireAuthorization("admin");

// Integridad entre servicios (§16): se consulta la API de Sensor, jamás su base de datos.
g.MapDelete("/{id:int}", async (int id, HttpContext ctx, ClaimsPrincipal u, CommunityDb db, IHttpClientFactory hf, AuditEmitter audit) =>
{
    var c = await db.Communities.FindAsync(id);
    if (c is null) return Results.NotFound();
    try
    {
        using var req = new HttpRequestMessage(HttpMethod.Get, $"api/sensors?comunidadId={id}&pageSize=1");
        req.Headers.Authorization = System.Net.Http.Headers.AuthenticationHeaderValue.Parse(ctx.Request.Headers.Authorization.ToString());
        using var resp = await hf.CreateClient("sensor").SendAsync(req, ctx.RequestAborted);
        if (!resp.IsSuccessStatusCode) return Results.Json(new { detail = "No se pudo verificar los sensores asociados" }, statusCode: 503);
        if (resp.Headers.TryGetValues("X-Total-Count", out var v) && int.TryParse(v.FirstOrDefault(), out var n) && n > 0)
            return Results.Conflict(new { detail = $"La comunidad tiene {n} sensor(es) asociado(s); desactívela o reasigne los sensores" });
    }
    catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
    {
        return Results.Json(new { detail = "Servicio de sensores no disponible" }, statusCode: 503);
    }
    db.Communities.Remove(c);
    await db.SaveChangesAsync();
    audit.Emit(u, "COMMUNITY_DELETED", "Comunidad", new { id, descripcion = $"Comunidad {c.NombreComunidad} eliminada" });
    return Results.NoContent();
}).RequireAuthorization("admin");

app.Run();
