namespace ClimGuard.Domain.Entities;

/// <summary>
/// Token de renovacion de sesion.
///
/// AGREGADO: no existia en DOC-10.
///
/// Para que sirve? El token de acceso (JWT) dura poco a proposito, 15 minutos,
/// para que si lo roban caduque rapido. Pero nadie quiere volver a escribir su
/// contrasena cada 15 minutos. El refresh token resuelve eso: dura dias, y sirve
/// solo para pedir un token de acceso nuevo.
///
/// Se guarda HASHEADO, igual que una contrasena: si alguien roba la base de datos,
/// no puede usar los tokens que encuentre ahi.
/// </summary>
public class RefreshToken
{
    public int IdRefreshToken { get; set; }
    public int IdUsuario { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTime FechaExpiracion { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaRevocacion { get; set; }

    public bool EstaActivo => FechaRevocacion is null && DateTime.UtcNow < FechaExpiracion;
}
