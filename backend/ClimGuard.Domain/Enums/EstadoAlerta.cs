namespace ClimGuard.Domain.Enums;

/// <summary>
/// Ciclo de vida de una alerta (tomado de DOC-09).
/// Activa -> alguien la ve -> Atendida -> se resuelve -> Cerrada
/// </summary>
public enum EstadoAlerta
{
    Activa = 1,
    Atendida = 2,
    Cerrada = 3
}
