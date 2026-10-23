package com.climguard.alert;

import com.climguard.alert.RuleEvaluator.RuleView;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

/** Prueba sin dependencias: javac + java (ver README). No requiere Spring ni JUnit. */
public class RuleEvaluatorSelfTest {
    static int fails = 0;
    static void check(boolean ok, String name) { System.out.println((ok ? "OK   " : "FAIL ") + name); if (!ok) fails++; }
    static BigDecimal bd(String s) { return new BigDecimal(s); }

    public static void main(String[] a) {
        var temp = new RuleView(1, 1, bd("10"), bd("35"), 3, true);
        var tempHi = new RuleView(2, 1, bd("0"), bd("45"), 4, true);
        var off = new RuleView(3, 1, bd("0"), bd("1"), 4, false);
        var rain = new RuleView(4, 4, bd("0"), bd("80"), 3, true);
        List<RuleView> rules = List.of(temp, tempHi, off, rain);
        check(RuleEvaluator.evaluate(rules, 1, bd("20")).isEmpty(), "dentro de rango no alerta");
        check(RuleEvaluator.evaluate(rules, 1, bd("10")).isEmpty() && RuleEvaluator.evaluate(rules, 1, bd("35")).isEmpty(), "límites inclusivos");
        check(RuleEvaluator.evaluate(rules, 1, bd("36")).get().id() == 1, "fuera de la regla 1 -> nivel 3");
        check(RuleEvaluator.evaluate(rules, 1, bd("50")).get().id() == 2, "varias violadas -> gana nivel más alto");
        check(RuleEvaluator.evaluate(rules, 1, bd("-1")).get().id() == 2, "por debajo del mínimo");
        check(RuleEvaluator.evaluate(rules, 4, bd("81")).get().id() == 4, "otro tipo de sensor");
        check(RuleEvaluator.evaluate(rules, 9, bd("999")).isEmpty(), "sin reglas para el tipo");
        check(RuleEvaluator.evaluate(List.of(off), 1, bd("5")).isEmpty(), "regla inactiva ignorada");
        Instant now = Instant.parse("2026-10-22T10:00:00Z");
        check(!RuleEvaluator.suppressed(null, now, Duration.ofSeconds(60)), "sin alerta previa no suprime");
        check(RuleEvaluator.suppressed(now.minusSeconds(30), now, Duration.ofSeconds(60)), "dentro del enfriamiento suprime");
        check(!RuleEvaluator.suppressed(now.minusSeconds(61), now, Duration.ofSeconds(60)), "pasado el enfriamiento no suprime");
        check(!RuleEvaluator.suppressed(now.minusSeconds(1), now, Duration.ZERO), "cooldown 0 desactiva supresión");
        System.exit(fails == 0 ? 0 : 1);
    }
}
