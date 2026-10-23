namespace ClimGuard.Domain.Enums;

/// <summary>
/// Estado operativo de un sensor (tomado de DOC-09).
/// Regla de negocio RN-007: un sensor inactivo no debe generar nuevas lecturas.
/// </summary>
public enum EstadoSensor
{
    Activo = 1,
    Inactivo = 2,
    Mantenimiento = 3,
    FueraDeLinea = 4
}
