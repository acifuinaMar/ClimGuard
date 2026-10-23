using ClimGuard.Domain.Entities;
using ClimGuard.Domain.Enums;
using ClimGuard.Domain.Exceptions;

namespace ClimGuard.Domain.Tests;

/// <summary>
/// Pruebas del motor de alertas.
/// Cada prueba corresponde a un requisito del enunciado.
/// </summary>
public class UmbralTests
{
    /// <summary>Sensor de nivel de rio: se vigila que SUBA. Dispara Inundacion.</summary>
    private static Umbral RioParaInundacion() => new()
    {
        IdSensor = 1,
        Operador = OperadorUmbral.MayorQue,
        ValorPrecaucion = 3.0m,
        ValorAlerta = 3.8m,
        ValorEmergencia = 4.5m,
        TipoFenomeno = TipoFenomeno.Inundacion
    };

    /// <summary>Termometro: se vigila que BAJE. Dispara Helada.</summary>
    private static Umbral TemperaturaParaHelada() => new()
    {
        IdSensor = 2,
        Operador = OperadorUmbral.MenorQue,
        ValorPrecaucion = 5.0m,
        ValorAlerta = 2.0m,
        ValorEmergencia = 0.0m,
        TipoFenomeno = TipoFenomeno.Helada
    };

    // ─────────── CORRECCION 1: los CUATRO niveles del enunciado ───────────

    [Theory]
    [InlineData(1.2, NivelRiesgo.Verde)]      // rio bajo, todo normal
    [InlineData(3.0, NivelRiesgo.Amarillo)]   // justo en el primer corte
    [InlineData(3.5, NivelRiesgo.Amarillo)]
    [InlineData(3.8, NivelRiesgo.Naranja)]    // justo en el segundo corte
    [InlineData(4.2, NivelRiesgo.Naranja)]
    [InlineData(4.5, NivelRiesgo.Rojo)]       // justo en el tercer corte
    [InlineData(6.0, NivelRiesgo.Rojo)]
    public void Rio_produce_los_cuatro_niveles(decimal valor, NivelRiesgo esperado)
    {
        Assert.Equal(esperado, RioParaInundacion().Evaluar(valor));
    }

    [Fact]
    public void El_sistema_distingue_los_cuatro_niveles_del_enunciado()
    {
        var umbral = RioParaInundacion();
        var niveles = new[] { 1.0m, 3.2m, 4.0m, 5.0m }
            .Select(umbral.Evaluar)
            .Distinct()
            .ToList();

        // DOC-09 solo definia 3 niveles. El enunciado exige 4.
        Assert.Equal(4, niveles.Count);
    }

    // ─────────── CORRECCION 2: detectar valores DEMASIADO BAJOS ───────────

    [Theory]
    [InlineData(18.0, NivelRiesgo.Verde)]     // tarde templada
    [InlineData(5.0, NivelRiesgo.Amarillo)]   // empieza a enfriar
    [InlineData(2.0, NivelRiesgo.Naranja)]    // riesgo de helada
    [InlineData(0.0, NivelRiesgo.Rojo)]       // congelacion
    [InlineData(-3.0, NivelRiesgo.Rojo)]      // helada severa
    public void Temperatura_detecta_helada_hacia_abajo(decimal valor, NivelRiesgo esperado)
    {
        Assert.Equal(esperado, TemperaturaParaHelada().Evaluar(valor));
    }

    [Fact]
    public void EL_BUG_DEL_MODELO_ORIGINAL_menos_tres_grados_ya_no_devuelve_verde()
    {
        // Con el modelo de DOC-09 (solo valorAdvertencia y valorCritico, sin
        // direccion), -3 grados devolvia NORMAL y el sistema jamas alertaba.
        // Helada era imposible de detectar. Esta prueba lo bloquea para siempre.
        var resultado = TemperaturaParaHelada().Evaluar(-3.0m);

        Assert.NotEqual(NivelRiesgo.Verde, resultado);
        Assert.Equal(NivelRiesgo.Rojo, resultado);
    }

    // ─────────── CORRECCION 3: la alerta sabe QUE fenomeno es ───────────

    [Fact]
    public void Cada_umbral_declara_su_propio_fenomeno()
    {
        // DOC-10 tenia Alerta.idTipoAlerta pero nada decia como se calculaba.
        // Ahora la regla lo lleva consigo: un rio alto es Inundacion, no Incendio.
        Assert.Equal(TipoFenomeno.Inundacion, RioParaInundacion().TipoFenomeno);
        Assert.Equal(TipoFenomeno.Helada, TemperaturaParaHelada().TipoFenomeno);
    }

    // ─────────── Proteccion contra configuracion silenciosamente rota ───────────

    [Fact]
    public void Un_umbral_ascendente_al_reves_es_rechazado()
    {
        var malConfigurado = new Umbral
        {
            IdSensor = 9,
            Operador = OperadorUmbral.MayorQue,
            ValorPrecaucion = 4.5m,   // invertidos
            ValorAlerta = 3.8m,
            ValorEmergencia = 3.0m,
            TipoFenomeno = TipoFenomeno.Inundacion
        };

        // Sin esta validacion el sistema no truena: simplemente NUNCA alerta.
        // Un sistema de alerta temprana silencioso es peor que no tenerlo.
        Assert.Throws<ReglaDeNegocioException>(() => malConfigurado.ValidarConfiguracion());
    }

    [Fact]
    public void Las_configuraciones_correctas_pasan_la_validacion()
    {
        RioParaInundacion().ValidarConfiguracion();
        TemperaturaParaHelada().ValidarConfiguracion();
    }
}
