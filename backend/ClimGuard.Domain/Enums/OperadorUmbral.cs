namespace ClimGuard.Domain.Enums;

/// <summary>
/// Dirección en la que se evalúa un umbral.
///
/// CORRECCIÓN respecto a DOC-09/DOC-10: el modelo original solo sabía expresar
/// "el valor subió demasiado". Pero el enunciado exige detectar Helada y Sequía,
/// que son condiciones de valor DEMASIADO BAJO:
///
///   Helada  -> la temperatura baja de cierto punto
///   Sequía  -> la lluvia o el nivel del río bajan de cierto punto
///
/// Sin este campo, un termómetro marcando -3 °C devolvería Verde.
/// </summary>
public enum OperadorUmbral
{
    /// <summary>Se dispara cuando la lectura SUBE del valor configurado. Ej.: nivel de río, viento.</summary>
    MayorQue = 1,

    /// <summary>Se dispara cuando la lectura BAJA del valor configurado. Ej.: temperatura (helada), lluvia (sequía).</summary>
    MenorQue = 2
}
