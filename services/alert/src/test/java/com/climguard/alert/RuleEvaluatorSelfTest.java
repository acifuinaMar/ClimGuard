package com.climguard.alert;

import com.climguard.alert.RuleEvaluator.RuleView;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * Prueba sin dependencias (javac + java; no requiere Spring ni JUnit).
 * SEMÁNTICA v2: la regla se activa cuando valor >= min && valor <= max (inclusivo).
 * Los vectores de la sección A están duplicados 1:1 en frontend/.../core/peligro.spec.ts (generados desde la misma tabla).
 *   javac -d out src/main/java/com/climguard/alert/RuleEvaluator.java src/test/java/com/climguard/alert/RuleEvaluatorSelfTest.java
 *   java -cp out com.climguard.alert.RuleEvaluatorSelfTest
 */
public class RuleEvaluatorSelfTest {
    static int fails = 0, total = 0;
    static void check(boolean ok, String name) { total++; System.out.println((ok ? "OK   " : "FAIL ") + name); if (!ok) fails++; }
    static BigDecimal bd(String s) { return new BigDecimal(s); }

    static void vec(String name, List<RuleView> rules, int tipo, String valor, Long expectedId) {
        Long got = RuleEvaluator.evaluate(rules, tipo, bd(valor)).map(RuleView::id).orElse(null);
        check(java.util.Objects.equals(got, expectedId), name + " (esperado=" + expectedId + ", obtenido=" + got + ")");
    }

    public static void main(String[] a) {
        // ---- A. Vectores compartidos con el frontend ----
        vec("min=35,max=100: 20 no activa", List.of(new RuleView(1, 1, bd("35"), bd("100"), 4, true)), 1, "20", null);
        vec("min=35,max=100: 34.99 no activa", List.of(new RuleView(1, 1, bd("35"), bd("100"), 4, true)), 1, "34.99", null);
        vec("min=35,max=100: 35 activa (limite inferior inclusivo)", List.of(new RuleView(1, 1, bd("35"), bd("100"), 4, true)), 1, "35", 1L);
        vec("min=35,max=100: 35.00 activa (escala decimal distinta)", List.of(new RuleView(1, 1, bd("35"), bd("100"), 4, true)), 1, "35.00", 1L);
        vec("min=35,max=100: 65 activa", List.of(new RuleView(1, 1, bd("35"), bd("100"), 4, true)), 1, "65", 1L);
        vec("min=35,max=100: 100 activa (limite superior inclusivo)", List.of(new RuleView(1, 1, bd("35"), bd("100"), 4, true)), 1, "100", 1L);
        vec("min=35,max=100: 100.01 no activa", List.of(new RuleView(1, 1, bd("35"), bd("100"), 4, true)), 1, "100.01", null);
        vec("min=35,max=100: 101 no activa", List.of(new RuleView(1, 1, bd("35"), bd("100"), 4, true)), 1, "101", null);
        vec("valor negativo fuera de todos los intervalos", List.of(new RuleView(1, 1, bd("35"), bd("100"), 4, true)), 1, "-5", null);
        vec("solapadas: 20 solo la regla amplia (nivel 2)", List.of(new RuleView(1, 1, bd("35"), bd("100"), 3, true), new RuleView(2, 1, bd("60"), bd("100"), 4, true), new RuleView(3, 1, bd("0"), bd("100"), 2, true)), 1, "20", 3L);
        vec("solapadas: 35 gana nivel 3 sobre nivel 2", List.of(new RuleView(1, 1, bd("35"), bd("100"), 3, true), new RuleView(2, 1, bd("60"), bd("100"), 4, true), new RuleView(3, 1, bd("0"), bd("100"), 2, true)), 1, "35", 1L);
        vec("solapadas: 59.99 sigue ganando nivel 3", List.of(new RuleView(1, 1, bd("35"), bd("100"), 3, true), new RuleView(2, 1, bd("60"), bd("100"), 4, true), new RuleView(3, 1, bd("0"), bd("100"), 2, true)), 1, "59.99", 1L);
        vec("solapadas: 60 gana nivel 4", List.of(new RuleView(1, 1, bd("35"), bd("100"), 3, true), new RuleView(2, 1, bd("60"), bd("100"), 4, true), new RuleView(3, 1, bd("0"), bd("100"), 2, true)), 1, "60", 2L);
        vec("solapadas: 100 gana nivel 4", List.of(new RuleView(1, 1, bd("35"), bd("100"), 3, true), new RuleView(2, 1, bd("60"), bd("100"), 4, true), new RuleView(3, 1, bd("0"), bd("100"), 2, true)), 1, "100", 2L);
        vec("solapadas: 100.5 fuera de todos", List.of(new RuleView(1, 1, bd("35"), bd("100"), 3, true), new RuleView(2, 1, bd("60"), bd("100"), 4, true), new RuleView(3, 1, bd("0"), bd("100"), 2, true)), 1, "100.5", null);
        vec("empate de nivel: gana el menor id", List.of(new RuleView(1, 1, bd("50"), bd("70"), 3, true), new RuleView(4, 1, bd("50"), bd("70"), 3, true)), 1, "55", 1L);
        vec("otro tipo de sensor no activa", List.of(new RuleView(1, 2, bd("0"), bd("20"), 3, true), new RuleView(2, 1, bd("0"), bd("100"), 4, false)), 1, "10", null);
        vec("tipo propio activa", List.of(new RuleView(1, 2, bd("0"), bd("20"), 3, true), new RuleView(2, 1, bd("0"), bd("100"), 4, false)), 2, "10", 1L);
        vec("regla inactiva ignorada", List.of(new RuleView(2, 1, bd("0"), bd("100"), 4, false)), 1, "50", null);
        vec("sensor sin reglas para su tipo", List.of(new RuleView(1, 1, bd("35"), bd("100"), 4, true)), 9, "50", null);
        vec("lista de reglas vacia", List.<RuleView>of(), 1, "50", null);
        vec("min==max: 50 activa", List.of(new RuleView(1, 1, bd("50"), bd("50"), 3, true)), 1, "50", 1L);
        vec("min==max: 50.01 no activa", List.of(new RuleView(1, 1, bd("50"), bd("50"), 3, true)), 1, "50.01", null);
        vec("intervalo negativo: -50 activa", List.of(new RuleView(1, 1, bd("-50"), bd("2"), 3, true)), 1, "-50", 1L);
        vec("intervalo negativo: 2 activa", List.of(new RuleView(1, 1, bd("-50"), bd("2"), 3, true)), 1, "2", 1L);
        vec("intervalo negativo: 2.01 no activa", List.of(new RuleView(1, 1, bd("-50"), bd("2"), 3, true)), 1, "2.01", null);
        vec("intervalo negativo: -50.01 no activa", List.of(new RuleView(1, 1, bd("-50"), bd("2"), 3, true)), 1, "-50.01", null);

        // ---- A2. Reglas LEGADAS (semántica anterior: alerta FUERA de [min,max]); vectores 1:1 en peligro.spec.ts ----
        RuleView leg = new RuleView(1, 1, bd("10"), bd("35"), 3, true, true);
        vec("legado [10,35]: 20 (normal) no alerta", List.of(leg), 1, "20", null);
        vec("legado [10,35]: 10 (borde normal) no alerta", List.of(leg), 1, "10", null);
        vec("legado [10,35]: 35 (borde normal) no alerta", List.of(leg), 1, "35", null);
        vec("legado [10,35]: 9.99 alerta", List.of(leg), 1, "9.99", 1L);
        vec("legado [10,35]: 35.01 alerta", List.of(leg), 1, "35.01", 1L);
        vec("legado inactivo se ignora", List.of(new RuleView(1, 1, bd("10"), bd("35"), 3, false, true)), 1, "50", null);
        RuleView nueva = new RuleView(2, 1, bd("35"), bd("100"), 4, true, false);
        vec("mixto: 40 gana la nueva (nivel 4 > 3)", List.of(leg, nueva), 1, "40", 2L);
        vec("mixto: 35 solo la nueva (inclusivo); legado no se viola", List.of(leg, nueva), 1, "35", 2L);
        vec("mixto: 5 solo el legado", List.of(leg, nueva), 1, "5", 1L);
        vec("mixto: 20 sin condicion", List.of(leg, nueva), 1, "20", null);
        vec("mixto empate de nivel: gana el menor id", List.of(new RuleView(5, 1, bd("10"), bd("35"), 3, true, true), new RuleView(2, 1, bd("50"), bd("100"), 3, true, false)), 1, "60", 2L);
        check(leg.semantica() == 1 && nueva.semantica() == 2, "semantica(): legado=1, nueva=2");
        check(new RuleView(9, 1, bd("1"), bd("2"), 1, true).legado() == false, "constructor de 6 argumentos = semantica nueva");

        // ---- B. Cooldown (por sensor y regla) ----
        Instant now = Instant.parse("2026-10-22T10:00:00Z");
        check(!RuleEvaluator.suppressed(null, now, Duration.ofSeconds(60)), "sin alerta previa no suprime");
        check(RuleEvaluator.suppressed(now.minusSeconds(30), now, Duration.ofSeconds(60)), "dentro del enfriamiento suprime");
        check(RuleEvaluator.suppressed(now.minusSeconds(59), now, Duration.ofSeconds(60)), "59 s suprime");
        check(!RuleEvaluator.suppressed(now.minusSeconds(60), now, Duration.ofSeconds(60)), "exactamente 60 s ya no suprime");
        check(!RuleEvaluator.suppressed(now.minusSeconds(61), now, Duration.ofSeconds(60)), "pasado el enfriamiento no suprime");
        check(!RuleEvaluator.suppressed(now.minusSeconds(1), now, Duration.ZERO), "cooldown 0 desactiva supresión");

        // ---- C. Condición de peligro != alerta creada ----
        // El evaluador NO conoce el cooldown: la condición se calcula igual aunque la alerta vaya a suprimirse.
        var regla = new RuleView(7, 1, bd("35"), bd("100"), 4, true);
        boolean condicion = RuleEvaluator.evaluate(List.of(regla), 1, bd("80")).isPresent();
        boolean suprimida = RuleEvaluator.suppressed(now.minusSeconds(10), now, Duration.ofSeconds(60));
        check(condicion && suprimida, "cooldown activo: la condicion de peligro persiste aunque no se cree alerta nueva");
        check(RuleEvaluator.SEMANTICS_VERSION == 2, "version de semantica = 2");

        System.out.println(total + " verificaciones, " + fails + " fallos");
        System.exit(fails == 0 ? 0 : 1);
    }
}
