package com.climguard.alert;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Lógica pura (sin Spring/JPA) de evaluación de reglas; probada con RuleEvaluatorTest y RuleEvaluatorSelfTest.
 *
 * <p>SEMÁNTICA (versión 2): {@code min} y {@code max} delimitan el intervalo que ACTIVA la regla (zona de peligro),
 * con límites inclusivos: la condición se cumple cuando {@code valor >= min && valor <= max}.
 * Antes (versión 1) delimitaban el rango normal y se alertaba fuera de él; esa semántica ya no existe.
 *
 * <p>TRANSICIÓN: las reglas creadas antes del cambio ({@code legado = true}, columna requiere_revision) NO se reinterpretan:
 * siguen evaluándose con su semántica original (alerta cuando {@code valor < min || valor > max}) hasta que un administrador
 * las convierta de forma explícita. Nunca se evalúa una regla antigua con la semántica nueva.
 *
 * <p>Esta clase es la única fuente de verdad del backend. El frontend implementa el mismo algoritmo en
 * {@code frontend/climguard-web/src/app/core/peligro.ts} y ambos se prueban con los mismos vectores
 * (RuleEvaluatorSelfTest.java y peligro.spec.ts).
 */
public final class RuleEvaluator {
    private RuleEvaluator() {}

    /** Versión de semántica con la que se crean las alertas nuevas (las anteriores a la migración son 1 = "fuera de rango"). */
    public static final int SEMANTICS_VERSION = 2;

    /** {@code legado}: regla de la semántica anterior (min/max = rango normal) que aún no fue convertida. */
    public record RuleView(long id, int tipoSensorId, BigDecimal min, BigDecimal max, int nivelAlertaId, boolean activo, boolean legado) {
        /** Regla con la semántica NUEVA (intervalo de peligro). */
        public RuleView(long id, int tipoSensorId, BigDecimal min, BigDecimal max, int nivelAlertaId, boolean activo) {
            this(id, tipoSensorId, min, max, nivelAlertaId, activo, false);
        }
        /** Versión de semántica con la que se evalúa esta regla (1 = legado, 2 = intervalo de peligro). */
        public int semantica() { return legado ? 1 : SEMANTICS_VERSION; }
    }

    /** Semántica nueva: ¿el valor está en el intervalo cerrado [min, max]? No mira activo ni tipo. */
    public static boolean inInterval(RuleView r, BigDecimal valor) {
        return valor.compareTo(r.min()) >= 0 && valor.compareTo(r.max()) <= 0;
    }

    /** ¿La regla se cumple para este valor? Nueva: dentro de [min,max]. Legado: FUERA de [min,max] (comportamiento previo). */
    public static boolean cumple(RuleView r, BigDecimal valor) {
        return r.legado() ? (valor.compareTo(r.min()) < 0 || valor.compareTo(r.max()) > 0) : inInterval(r, valor);
    }

    /**
     * Nivel de peligro de una lectura: la regla ACTIVA del mismo tipo de sensor cuyo intervalo contiene el valor.
     * Con varias coincidencias gana el nivel más alto; a igual nivel, la regla de menor id (determinista).
     * Vacío = sin condición de peligro (sin reglas para el tipo, o valor fuera de todos los intervalos).
     * No considera el cooldown: eso decide solo si se CREA una alerta, no si existe la condición.
     */
    public static Optional<RuleView> evaluate(List<RuleView> rules, int tipoSensorId, BigDecimal valor) {
        RuleView best = null;
        for (RuleView r : rules) {
            if (!r.activo() || r.tipoSensorId() != tipoSensorId || !cumple(r, valor)) continue;
            if (best == null || r.nivelAlertaId() > best.nivelAlertaId()
                    || (r.nivelAlertaId() == best.nivelAlertaId() && r.id() < best.id())) best = r;
        }
        return Optional.ofNullable(best);
    }

    /** Evita inundar de alertas repetidas del mismo sensor/regla. */
    public static boolean suppressed(Instant lastAlertAt, Instant now, Duration cooldown) {
        return lastAlertAt != null && !cooldown.isZero() && Duration.between(lastAlertAt, now).compareTo(cooldown) < 0;
    }
}
