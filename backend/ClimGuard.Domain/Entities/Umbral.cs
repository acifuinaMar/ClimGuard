using ClimGuard.Domain.Enums;
using ClimGuard.Domain.Exceptions;

namespace ClimGuard.Domain.Entities;

/// <summary>
/// Una REGLA de vigilancia sobre un sensor.
///
/// Léela como una frase:
///   "Para el sensor 7, cuando el valor SUBA de 3.0 / 3.8 / 4.5 metros,
///    genera una alerta Amarilla / Naranja / Roja de tipo Inundación."
///
/// ─────────────────────────────────────────────────────────────────────────
/// TRES CORRECCIONES respecto a DOC-09 y DOC-10:
///
/// 1) TRES valores en vez de dos.
///    El documento tenía valorAdvertencia y valorCritico. Dos umbrales parten
///    la recta numérica en TRES bandas, y el enunciado exige CUATRO niveles.
///    Es aritmética: para 4 bandas hacen falta 3 cortes.
///
/// 2) Campo Operador.
///    Permite vigilar hacia abajo, que es lo que exigen Helada y Sequía.
///
/// 3) Campo TipoFenomeno.
///    DOC-10 tenía Alerta.idTipoAlerta pero NADA decía cómo se calculaba.
///    Al ponerlo aquí, cada regla declara qué significa cuando se dispara.
///    Así el sistema sabe que un río alto es Inundación y no Incendio.
///
/// Y una cuarta: un sensor puede tener VARIOS umbrales (uno por dirección),
/// no uno solo. Un termómetro necesita dos reglas: una para Helada (hacia
/// abajo) y otra para ola de calor (hacia arriba). Esto además concuerda con
/// RN-014, que dice "al menos un umbral" — o sea, ya preveía varios.
/// ─────────────────────────────────────────────────────────────────────────
/// </summary>
public class Umbral
{
    public int IdUmbral { get; set; }
    public int IdSensor { get; set; }

    /// <summary>Hacia dónde se vigila: que suba de más, o que baje de más.</summary>
    public OperadorUmbral Operador { get; set; }

    /// <summary>Primer corte: a partir de aquí, Amarillo (Precaución).</summary>
    public decimal ValorPrecaucion { get; set; }

    /// <summary>Segundo corte: a partir de aquí, Naranja (Alerta).</summary>
    public decimal ValorAlerta { get; set; }

    /// <summary>Tercer corte: a partir de aquí, Rojo (Emergencia).</summary>
    public decimal ValorEmergencia { get; set; }

    /// <summary>Qué fenómeno representa esta regla cuando se dispara.</summary>
    public TipoFenomeno TipoFenomeno { get; set; }

    public bool Activo { get; set; } = true;

    /// <summary>
    /// EL CORAZÓN DEL SISTEMA.
    /// Convierte un número crudo del sensor en un nivel de peligro.
    ///
    /// Fíjate en el orden de las comparaciones: siempre de lo MÁS grave a lo
    /// menos grave. Si preguntaras primero por Amarillo, una lectura de
    /// emergencia entraría por esa rama y saldría clasificada como Amarillo.
    /// </summary>
    public NivelRiesgo Evaluar(decimal valor)
    {
        if (Operador == OperadorUmbral.MayorQue)
        {
            if (valor >= ValorEmergencia) return NivelRiesgo.Rojo;
            if (valor >= ValorAlerta)     return NivelRiesgo.Naranja;
            if (valor >= ValorPrecaucion) return NivelRiesgo.Amarillo;
            return NivelRiesgo.Verde;
        }

        // MenorQue: la escala va al revés. Cuanto MÁS BAJO, más grave.
        if (valor <= ValorEmergencia) return NivelRiesgo.Rojo;
        if (valor <= ValorAlerta)     return NivelRiesgo.Naranja;
        if (valor <= ValorPrecaucion) return NivelRiesgo.Amarillo;
        return NivelRiesgo.Verde;
    }

    /// <summary>
    /// Verifica que los tres cortes estén en el orden correcto.
    ///
    /// ¿Por qué molestarse? Porque una configuración al revés no truena:
    /// simplemente hace que el sistema NUNCA alerte. Sería un sistema de alerta
    /// temprana silencioso, y nadie se daría cuenta hasta la inundación.
    /// Mejor que reviente al configurarlo que que falle callado en producción.
    /// </summary>
    public void ValidarConfiguracion()
    {
        bool ordenCorrecto = Operador == OperadorUmbral.MayorQue
            ? ValorPrecaucion < ValorAlerta && ValorAlerta < ValorEmergencia
            : ValorPrecaucion > ValorAlerta && ValorAlerta > ValorEmergencia;

        if (!ordenCorrecto)
        {
            string esperado = Operador == OperadorUmbral.MayorQue
                ? "precaución < alerta < emergencia"
                : "precaución > alerta > emergencia";

            throw new ReglaDeNegocioException(
                $"Umbral mal configurado para el sensor {IdSensor}. " +
                $"Con el operador {Operador} se espera {esperado}, pero se recibió " +
                $"{ValorPrecaucion} / {ValorAlerta} / {ValorEmergencia}.");
        }
    }
}
