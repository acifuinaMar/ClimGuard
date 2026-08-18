namespace ClimGuard.Domain.Enums;

/// <summary>
/// Fenómeno climático detectado. Son exactamente los cinco que exige el enunciado:
///   "Inundación / Sequía / Tormenta / Helada / Incendio forestal"
/// </summary>
public enum TipoFenomeno
{
    Inundacion = 1,
    Sequia = 2,
    Tormenta = 3,
    Helada = 4,
    IncendioForestal = 5
}
