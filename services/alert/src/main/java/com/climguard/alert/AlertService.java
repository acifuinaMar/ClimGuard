package com.climguard.alert;

import com.climguard.alert.Entities.*;
import com.climguard.alert.Repos.*;
import com.climguard.alert.RuleEvaluator.RuleView;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.*;
import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AlertService {
    public record Evaluate(Integer sensorId, Integer comunidadId, Integer tipoSensorId, BigDecimal valor, Instant fechaHora) {}
    public record Filter(Integer comunidadId, Integer sensorId, Integer nivelAlertaId, Integer tipoFenomenoId, Integer estadoAlertaId,
                         Boolean activo, Instant desde, Instant hasta) {}
    public record Count(Integer id, long cantidad) {}

    private final AlertRepo alerts; private final RuleRepo rules; private final EventRepo events; private final StateRepo states;
    private final EntityManager em; private final Duration cooldown; private final AuditClient audit;

    public AlertService(AlertRepo alerts, RuleRepo rules, EventRepo events, StateRepo states, EntityManager em, AuditClient audit,
                        @Value("${climguard.cooldown-seconds:60}") long cooldownSeconds) {
        this.alerts = alerts; this.rules = rules; this.events = events; this.states = states; this.em = em; this.audit = audit;
        this.cooldown = Duration.ofSeconds(cooldownSeconds);
    }

    /** Evalúa una lectura; devuelve la alerta creada o vacío (dentro de rango / en enfriamiento). */
    @Transactional
    public Optional<Alert> evaluate(Evaluate e) {
        if (e.sensorId() == null || e.comunidadId() == null || e.tipoSensorId() == null || e.valor() == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "sensorId, comunidadId, tipoSensorId y valor son obligatorios");
        List<RuleView> views = rules.findByActivoTrue().stream()
                .map(r -> new RuleView(r.reglaAlertaId, r.tipoSensorId, r.valorMin, r.valorMax, r.nivelAlertaId, r.activo)).toList();
        Optional<RuleView> hit = RuleEvaluator.evaluate(views, e.tipoSensorId(), e.valor());
        if (hit.isEmpty()) return Optional.empty();
        RuleView rv = hit.get();
        Instant when = e.fechaHora() != null ? e.fechaHora() : Instant.now();
        if (RuleEvaluator.suppressed(alerts.lastAt(e.sensorId(), rv.id()), when, cooldown)) return Optional.empty();
        AlertRule rule = rules.findById(rv.id()).orElseThrow();
        Alert a = new Alert();
        a.valorDetectado = e.valor(); a.mensajeSnap = rule.mensaje; a.nivelAlertaIdSnap = rule.nivelAlertaId;
        a.tipoFenomenoIdSnap = rule.tipoFenomenoId; a.fechaHora = when; a.sensorId = e.sensorId(); a.comunidadId = e.comunidadId();
        a.reglaAlertaId = rule.reglaAlertaId; a.umbralMin = rule.valorMin; a.umbralMax = rule.valorMax; a.estadoAlertaId = 1; a.usuarioIng = 1;
        alerts.save(a);
        record(a, "Alerta generada", "Alerta generada por " + rule.mensaje, null);
        return Optional.of(a);
    }

    @Transactional
    public Alert transition(long id, int newState, String eventName, Integer userId, String username) {
        Alert a = alerts.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Alerta no encontrada"));
        if (!states.existsById(newState)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado inválido");
        if (a.estadoAlertaId >= newState) throw new ResponseStatusException(HttpStatus.CONFLICT, "La alerta ya está en un estado igual o posterior");
        a.estadoAlertaId = newState; a.usuarioResponsableId = userId; a.usuarioAct = userId; a.fechaAct = Instant.now();
        a.activo = false;   // atendida o cerrada: deja de estar activa
        alerts.save(a);
        record(a, eventName, eventName + " (alerta " + id + ")", userId);
        audit.emit(newState == 2 ? "ALERT_ATTENDED" : "ALERT_CLOSED", "Alerta", String.valueOf(userId), username, Map.of("id", id, "descripcion", eventName));
        return a;
    }

    private void record(Alert a, String name, String description, Integer userId) {
        AlertEvent ev = new AlertEvent();
        ev.tipoEventoNombre = name; ev.descripcion = description; ev.fechaHora = Instant.now(); ev.alertaId = a.alertaId;
        ev.sensorId = a.sensorId; ev.comunidadId = a.comunidadId; ev.tipoFenomenoId = a.tipoFenomenoIdSnap; ev.nivelAlertaId = a.nivelAlertaIdSnap; ev.usuarioId = userId;
        events.save(ev);
    }

    // ---- filtros ----
    public Specification<Alert> alertSpec(Filter f) {
        return (r, q, cb) -> cb.and(preds(cb, r, f, "fechaHora").toArray(new Predicate[0]));
    }
    public Specification<AlertEvent> eventSpec(Filter f) {
        return (r, q, cb) -> {
            List<Predicate> p = new ArrayList<>();
            eq(cb, p, r.get("comunidadId"), f.comunidadId()); eq(cb, p, r.get("sensorId"), f.sensorId());
            eq(cb, p, r.get("nivelAlertaId"), f.nivelAlertaId()); eq(cb, p, r.get("tipoFenomenoId"), f.tipoFenomenoId());
            range(cb, p, r.get("fechaHora"), f.desde(), f.hasta());
            return cb.and(p.toArray(new Predicate[0]));
        };
    }
    private List<Predicate> preds(CriteriaBuilder cb, From<?, ?> r, Filter f, String dateField) {
        List<Predicate> p = new ArrayList<>();
        eq(cb, p, r.get("comunidadId"), f.comunidadId()); eq(cb, p, r.get("sensorId"), f.sensorId());
        eq(cb, p, r.get("nivelAlertaIdSnap"), f.nivelAlertaId()); eq(cb, p, r.get("tipoFenomenoIdSnap"), f.tipoFenomenoId());
        eq(cb, p, r.get("estadoAlertaId"), f.estadoAlertaId()); eq(cb, p, r.get("activo"), f.activo());
        range(cb, p, r.get(dateField), f.desde(), f.hasta());
        return p;
    }
    private static void eq(CriteriaBuilder cb, List<Predicate> p, Path<?> path, Object v) { if (v != null) p.add(cb.equal(path, v)); }
    private static void range(CriteriaBuilder cb, List<Predicate> p, Path<Instant> path, Instant from, Instant to) {
        if (from != null) p.add(cb.greaterThanOrEqualTo(path, from));
        if (to != null) p.add(cb.lessThanOrEqualTo(path, to));
    }

    // ---- estadísticas ----
    public Map<String, Object> stats(Filter f) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("total", countAlerts(f, null));
        out.put("activas", countAlerts(f, true));
        out.put("totalEventos", events.count(eventSpec(f)));
        out.put("porNivel", group(f, "nivelAlertaIdSnap"));
        out.put("porFenomeno", group(f, "tipoFenomenoIdSnap"));
        out.put("porComunidad", group(f, "comunidadId"));
        return out;
    }
    private long countAlerts(Filter f, Boolean activo) {
        Filter g = new Filter(f.comunidadId(), f.sensorId(), f.nivelAlertaId(), f.tipoFenomenoId(), f.estadoAlertaId(), activo != null ? activo : f.activo(), f.desde(), f.hasta());
        return alerts.count(alertSpec(g));
    }
    private List<Count> group(Filter f, String field) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<Object[]> q = cb.createQuery(Object[].class);
        Root<Alert> r = q.from(Alert.class);
        q.multiselect(r.get(field), cb.count(r)).where(preds(cb, r, f, "fechaHora").toArray(new Predicate[0])).groupBy(r.get(field)).orderBy(cb.asc(r.get(field)));
        return em.createQuery(q).getResultList().stream().map(o -> new Count((Integer) o[0], (Long) o[1])).toList();
    }
}
