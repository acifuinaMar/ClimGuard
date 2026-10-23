package com.climguard.alert;

import com.climguard.alert.Entities.*;
import com.climguard.alert.Repos.*;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
class Errors {
    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<Map<String, String>> status(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("detail", e.getReason() == null ? "Error" : e.getReason()));
    }
    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    ResponseEntity<Map<String, String>> badBody() { return ResponseEntity.badRequest().body(Map.of("detail", "Cuerpo de la petición inválido")); }
    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    ResponseEntity<Map<String, String>> notFound() { return ResponseEntity.status(404).body(Map.of("detail", "Recurso no encontrado")); }
    @ExceptionHandler({org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,
                       org.springframework.web.bind.MissingServletRequestParameterException.class})
    ResponseEntity<Map<String, String>> badParam() { return ResponseEntity.badRequest().body(Map.of("detail", "Parámetro inválido")); }
    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> other(Exception e) {
        org.slf4j.LoggerFactory.getLogger("Errors").error("Error no controlado", e);
        return ResponseEntity.status(500).body(Map.of("detail", "Error interno"));
    }
}

@RestController
class HealthController {
    private final EntityManager em;
    HealthController(EntityManager em) { this.em = em; }
    @GetMapping("/health") Map<String, String> health() { return Map.of("status", "ok"); }
    @GetMapping("/ready") Map<String, String> ready() {
        try { em.createNativeQuery("select 1").getSingleResult(); return Map.of("status", "ready"); }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "db-unavailable"); }
    }
}

/** Catálogos de la Fase 2 (siempre) + reglas demo (solo con SEED_DEMO=true). */
@Component
class Seed implements CommandLineRunner {
    private final LevelRepo levels; private final PhenomenonRepo phen; private final StateRepo states; private final RuleRepo rules; private final boolean demo;
    Seed(LevelRepo l, PhenomenonRepo p, StateRepo s, RuleRepo r, @Value("${climguard.seed-demo:false}") boolean demo) {
        levels = l; phen = p; states = s; rules = r; this.demo = demo;
    }
    @Override public void run(String... args) {
        if (levels.count() == 0) {
            String[][] lv = {{"Normal", "#28A745"}, {"Precaución", "#FFC107"}, {"Alerta", "#FD7E14"}, {"Emergencia", "#DC3545"}};
            for (String[] x : lv) { AlertLevel l = new AlertLevel(); l.nombre = x[0]; l.colorHex = x[1]; levels.save(l); }
        }
        if (phen.count() == 0) for (String n : List.of("Inundación", "Sequía", "Tormenta", "Helada", "Incendio Forestal")) { Phenomenon p = new Phenomenon(); p.nombre = n; phen.save(p); }
        if (states.count() == 0) for (String n : List.of("Activa", "Atendida", "Cerrada")) { AlertState s = new AlertState(); s.nombre = n; states.save(s); }
        if (demo && rules.count() == 0) {
            // tipoSensorId: 1 Temperatura, 2 Humedad, 4 Lluvia, 5 Nivel de río (catálogo de Sensor Service)
            Object[][] d = {{1, 10, 35, 3, 4, "Temperatura fuera de rango"}, {2, 20, 90, 2, 3, "Humedad fuera de rango"},
                            {4, 0, 80, 3, 1, "Lluvia intensa"}, {5, 0, 85, 4, 1, "Nivel de río crítico"}};
            for (Object[] x : d) {
                AlertRule r = new AlertRule(); r.tipoSensorId = (Integer) x[0]; r.valorMin = BigDecimal.valueOf((Integer) x[1]); r.valorMax = BigDecimal.valueOf((Integer) x[2]);
                r.nivelAlertaId = (Integer) x[3]; r.tipoFenomenoId = (Integer) x[4]; r.mensaje = (String) x[5]; r.usuarioIng = 1; rules.save(r);
            }
        }
    }
}
