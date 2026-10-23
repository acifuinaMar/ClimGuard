package com.climguard.alert;

import com.climguard.alert.AlertService.Evaluate;
import com.climguard.alert.AlertService.Filter;
import com.climguard.alert.Entities.*;
import com.climguard.alert.Repos.*;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.*;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class AlertController {
    private final Security sec; private final AlertService svc; private final AlertRepo alerts; private final EventRepo events;
    private final LevelRepo levels; private final PhenomenonRepo phenomena; private final StateRepo states; private final RuleRepo rules; private final AuditClient audit;

    public AlertController(Security sec, AlertService svc, AlertRepo alerts, EventRepo events, LevelRepo levels, PhenomenonRepo phenomena,
                           StateRepo states, RuleRepo rules, AuditClient audit) {
        this.sec = sec; this.svc = svc; this.alerts = alerts; this.events = events; this.levels = levels; this.phenomena = phenomena;
        this.states = states; this.rules = rules; this.audit = audit;
    }

    private static PageRequest page(int page, int size) { return PageRequest.of(Math.max(1, page) - 1, Math.min(Math.max(1, size), 1000)); }
    private static <T> ResponseEntity<List<T>> paged(Page<T> p) {
        return ResponseEntity.ok().header("X-Total-Count", String.valueOf(p.getTotalElements())).body(p.getContent());
    }

    // ---- catálogos ----
    @GetMapping("/api/levels") public List<AlertLevel> levels(HttpServletRequest r) { sec.user(r); return levels.findAll(Sort.by("nivelAlertaId")); }
    @GetMapping("/api/alert-states") public List<AlertState> states(HttpServletRequest r) { sec.user(r); return states.findAll(Sort.by("estadoAlertaId")); }
    @GetMapping("/api/phenomena") public List<Phenomenon> phenomena(HttpServletRequest r) { sec.user(r); return phenomena.findAll(Sort.by("tipoFenomenoId")); }

    @PostMapping("/api/phenomena") @ResponseStatus(HttpStatus.CREATED)
    public Phenomenon createPhenomenon(@RequestBody Phenomenon in, HttpServletRequest r) {
        var u = sec.operator(r);
        if (in.nombre == null || in.nombre.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre obligatorio");
        in.tipoFenomenoId = null;
        Phenomenon saved = phenomena.save(in);
        audit.emit("PHENOMENON_CREATED", "TipoFenomeno", u.id(), u.username(), Map.of("id", saved.tipoFenomenoId, "descripcion", "Fenómeno " + saved.nombre + " creado"));
        return saved;
    }
    @PutMapping("/api/phenomena/{id}")
    public Phenomenon updatePhenomenon(@PathVariable Integer id, @RequestBody Phenomenon in, HttpServletRequest r) {
        var u = sec.operator(r);
        Phenomenon p = phenomena.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No encontrado"));
        if (in.nombre == null || in.nombre.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre obligatorio");
        p.nombre = in.nombre.trim(); p.activo = in.activo;
        audit.emit("PHENOMENON_UPDATED", "TipoFenomeno", u.id(), u.username(), Map.of("id", id, "descripcion", "Fenómeno actualizado"));
        return phenomena.save(p);
    }

    @DeleteMapping("/api/phenomena/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePhenomenon(@PathVariable Integer id, HttpServletRequest r) {
        var u = sec.operator(r);
        if (!phenomena.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No encontrado");
        if (rules.findAll().stream().anyMatch(x -> id.equals(x.tipoFenomenoId))) throw new ResponseStatusException(HttpStatus.CONFLICT, "El fenómeno tiene reglas asociadas");
        phenomena.deleteById(id);
        audit.emit("PHENOMENON_DELETED", "TipoFenomeno", u.id(), u.username(), Map.of("id", id, "descripcion", "Fenómeno eliminado"));
    }

    // ---- reglas ----
    @GetMapping("/api/rules") public List<AlertRule> rules(HttpServletRequest r) { sec.user(r); return rules.findAll(Sort.by("reglaAlertaId")); }

    private void validate(AlertRule in) {
        if (in.tipoSensorId == null || in.valorMin == null || in.valorMax == null || in.nivelAlertaId == null || in.tipoFenomenoId == null
                || in.mensaje == null || in.mensaje.isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faltan campos obligatorios de la regla");
        if (in.valorMin.compareTo(in.valorMax) > 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "valorMin no puede superar a valorMax");
        if (!levels.existsById(in.nivelAlertaId) || !phenomena.existsById(in.tipoFenomenoId)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nivel o fenómeno inválido");
    }
    @PostMapping("/api/rules") @ResponseStatus(HttpStatus.CREATED)
    public AlertRule createRule(@RequestBody AlertRule in, HttpServletRequest r) {
        var u = sec.admin(r); validate(in);
        if (in.nombre == null || in.nombre.isBlank()) in.nombre = in.mensaje;
        in.reglaAlertaId = null; in.usuarioIng = parse(u.id()); in.fechaIng = Instant.now();
        AlertRule s = rules.save(in);
        audit.emit("RULE_CREATED", "ReglaAlerta", u.id(), u.username(), Map.of("id", s.reglaAlertaId, "descripcion", "Regla creada"));
        return s;
    }
    @PutMapping("/api/rules/{id}")
    public AlertRule updateRule(@PathVariable Long id, @RequestBody AlertRule in, HttpServletRequest r) {
        var u = sec.admin(r); validate(in);
        AlertRule x = rules.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Regla no encontrada"));
        x.nombre = (in.nombre == null || in.nombre.isBlank()) ? in.mensaje : in.nombre; x.tipoSensorId = in.tipoSensorId; x.valorMin = in.valorMin; x.valorMax = in.valorMax; x.nivelAlertaId = in.nivelAlertaId;
        x.tipoFenomenoId = in.tipoFenomenoId; x.mensaje = in.mensaje.trim(); x.activo = in.activo; x.usuarioAct = parse(u.id()); x.fechaAct = Instant.now();
        audit.emit("RULE_UPDATED", "ReglaAlerta", u.id(), u.username(), Map.of("id", id, "descripcion", "Regla modificada"));
        return rules.save(x);
    }
    @DeleteMapping("/api/rules/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRule(@PathVariable Long id, HttpServletRequest r) {
        var u = sec.admin(r);
        if (!rules.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Regla no encontrada");
        rules.deleteById(id);   // las alertas conservan su snapshot (mensajeSnap, umbrales)
        audit.emit("RULE_DELETED", "ReglaAlerta", u.id(), u.username(), Map.of("id", id, "descripcion", "Regla eliminada"));
    }
    private static Integer parse(String s) { try { return Integer.valueOf(s); } catch (NumberFormatException e) { return null; } }

    // ---- alertas ----
    @GetMapping("/api/alerts")
    public ResponseEntity<List<Alert>> list(HttpServletRequest r, @RequestParam(required = false) Integer comunidadId, @RequestParam(required = false) Integer sensorId,
            @RequestParam(required = false) Integer nivelAlertaId, @RequestParam(required = false) Integer tipoFenomenoId, @RequestParam(required = false) Integer estadoAlertaId,
            @RequestParam(required = false) Boolean activo, @RequestParam(required = false) Instant desde, @RequestParam(required = false) Instant hasta,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "500") int pageSize) {
        sec.user(r);
        var f = new Filter(comunidadId, sensorId, nivelAlertaId, tipoFenomenoId, estadoAlertaId, activo, desde, hasta);
        return paged(alerts.findAll(svc.alertSpec(f), page(page, pageSize).withSort(Sort.by(Sort.Direction.DESC, "fechaHora"))));
    }

    @GetMapping("/api/alerts/events")
    public ResponseEntity<List<AlertEvent>> eventList(HttpServletRequest r, @RequestParam(required = false) Integer comunidadId, @RequestParam(required = false) Integer sensorId,
            @RequestParam(required = false) Integer nivelAlertaId, @RequestParam(required = false) Integer tipoFenomenoId,
            @RequestParam(required = false) Instant desde, @RequestParam(required = false) Instant hasta,
            @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "500") int pageSize) {
        sec.user(r);
        var f = new Filter(comunidadId, sensorId, nivelAlertaId, tipoFenomenoId, null, null, desde, hasta);
        return paged(events.findAll(svc.eventSpec(f), page(page, pageSize).withSort(Sort.by(Sort.Direction.DESC, "fechaHora"))));
    }

    @GetMapping("/api/alerts/stats")
    public Map<String, Object> stats(HttpServletRequest r, @RequestParam(required = false) Integer comunidadId, @RequestParam(required = false) Instant desde,
            @RequestParam(required = false) Instant hasta) {
        sec.user(r);
        return svc.stats(new Filter(comunidadId, null, null, null, null, null, desde, hasta));
    }

    @GetMapping("/api/alerts/{id}")
    public Alert get(@PathVariable Long id, HttpServletRequest r) {
        sec.user(r);
        return alerts.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alerta no encontrada"));
    }

    @PostMapping("/api/alerts/{id}/attend")
    public Alert attend(@PathVariable Long id, HttpServletRequest r) {
        var u = sec.operator(r); return svc.transition(id, 2, "Alerta atendida", parse(u.id()), u.username());
    }
    @PostMapping("/api/alerts/{id}/close")
    public Alert close(@PathVariable Long id, HttpServletRequest r) {
        var u = sec.operator(r); return svc.transition(id, 3, "Alerta cerrada", parse(u.id()), u.username());
    }

    /** Llamado por Sensor Service (X-Internal-Key) o por un operador autenticado. */
    @PostMapping("/api/alerts/evaluate")
    public ResponseEntity<Map<String, Object>> evaluate(@RequestBody Evaluate in, HttpServletRequest r) {
        if (!sec.internalOk(r)) sec.operator(r);
        Optional<Alert> a = svc.evaluate(in);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("generated", a.isPresent());
        body.put("alert", a.map(x -> Map.of("alertaId", x.alertaId, "comunidadId", x.comunidadId, "sensorId", x.sensorId,
                "tipoFenomenoIdSnap", x.tipoFenomenoIdSnap, "nivelAlertaIdSnap", x.nivelAlertaIdSnap, "mensajeSnap", x.mensajeSnap,
                "fechaHora", x.fechaHora, "activo", x.activo)).orElse(null));
        return ResponseEntity.ok(body);
    }
}
