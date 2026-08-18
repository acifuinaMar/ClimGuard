namespace ClimGuard.Domain.Enums;

/// <summary>
/// Nivel de peligro de una alerta.
///
///   "Verde (Normal) / Amarillo (Precaución) / Naranja (Alerta) / Rojo (Emergencia)"
///
/// Los valores numéricos son explícitos y ascendentes a propósito: así se pueden
/// comparar (nivel >= NivelRiesgo.Naranja) y ordenar en consultas SQL.
/// Nunca dependas del orden implícito de un enum: si alguien inserta un valor
/// en medio, se corrompen todos los datos ya guardados.
/// </summary>
public enum NivelRiesgo
{
    Verde = 1,
    Amarillo = 2,
    Naranja = 3,
    Rojo = 4
}
