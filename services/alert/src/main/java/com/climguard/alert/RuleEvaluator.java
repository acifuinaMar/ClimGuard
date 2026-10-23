package com.climguard.alert;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/** Lógica pura (sin Spring/JPA) de evaluación de reglas; probada con RuleEvaluatorSelfTest. */
public final class RuleEvaluator {
    private RuleEvaluator() {}

    public record RuleView(long id, int tipoSensorId, BigDecimal min, BigDecimal max, int nivelAlertaId, boolean activo) {}

    /** Una regla define el rango NORMAL [min,max]; se viola si el valor queda fuera. Con varias violadas gana el nivel más alto. */
    public static Optional<RuleView> evaluate(List<RuleView> rules, int tipoSensorId, BigDecimal valor) {
        RuleView best = null;
        for (RuleView r : rules) {
            if (!r.activo() || r.tipoSensorId() != tipoSensorId) continue;
            boolean violated = valor.compareTo(r.min()) < 0 || valor.compareTo(r.max()) > 0;
            if (violated && (best == null || r.nivelAlertaId() > best.nivelAlertaId()
                    || (r.nivelAlertaId() == best.nivelAlertaId() && r.id() < best.id()))) best = r;
        }
        return Optional.ofNullable(best);
    }

    /** Evita inundar de alertas repetidas del mismo sensor/regla. */
    public static boolean suppressed(Instant lastAlertAt, Instant now, Duration cooldown) {
        return lastAlertAt != null && !cooldown.isZero() && Duration.between(lastAlertAt, now).compareTo(cooldown) < 0;
    }
}
