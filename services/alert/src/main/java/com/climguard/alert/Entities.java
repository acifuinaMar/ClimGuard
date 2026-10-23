package com.climguard.alert;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

/** Entidades JPA con campos públicos: el JSON de la API usa exactamente los nombres de la Fase 2 (camelCase en español). */
public final class Entities {
    private Entities() {}

    @Entity @Table(name = "nivel_alerta")
    public static class AlertLevel {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Integer nivelAlertaId;
        @Column(nullable = false, length = 50) public String nombre;
        @Column(nullable = false, length = 9) public String colorHex;
        public boolean activo = true;
    }

    @Entity @Table(name = "tipo_fenomeno")
    public static class Phenomenon {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Integer tipoFenomenoId;
        @Column(nullable = false, length = 80) public String nombre;
        public boolean activo = true;
    }

    @Entity @Table(name = "estado_alerta")
    public static class AlertState {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Integer estadoAlertaId;
        @Column(nullable = false, length = 50) public String nombre;
        public boolean activo = true;
    }

    @Entity @Table(name = "regla_alerta")
    public static class AlertRule {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long reglaAlertaId;
        @Column(length = 120) public String nombre;
        @Column(nullable = false) public Integer tipoSensorId;   // referencia lógica a Sensor Service
        @Column(nullable = false, precision = 18, scale = 2) public BigDecimal valorMin;
        @Column(nullable = false, precision = 18, scale = 2) public BigDecimal valorMax;
        @Column(nullable = false) public Integer nivelAlertaId;
        @Column(nullable = false) public Integer tipoFenomenoId;
        @Column(nullable = false, length = 300) public String mensaje;
        public boolean activo = true;
        public Integer usuarioIng; public Instant fechaIng = Instant.now();
        public Integer usuarioAct; public Instant fechaAct;
    }

    @Entity(name = "Alert")
        @Table(name = "alerta", indexes = {
            @Index(columnList = "fechaHora"),
            @Index(columnList = "comunidadId"),
            @Index(columnList = "sensorId,reglaAlertaId,fechaHora")
        })
    public static class Alert {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long alertaId;
        @Column(nullable = false, precision = 18, scale = 2) public BigDecimal valorDetectado;
        @Column(nullable = false, length = 300) public String mensajeSnap;
        @Column(nullable = false) public Integer nivelAlertaIdSnap;
        @Column(nullable = false) public Integer tipoFenomenoIdSnap;
        @Column(nullable = false) public Instant fechaHora;
        public boolean activo = true;
        @Column(nullable = false) public Integer sensorId;
        @Column(nullable = false) public Integer comunidadId;
        public Long reglaAlertaId;
        @Column(precision = 18, scale = 2) public BigDecimal umbralMin;
        @Column(precision = 18, scale = 2) public BigDecimal umbralMax;
        @Column(nullable = false) public Integer estadoAlertaId = 1;
        public Integer usuarioResponsableId;
        public Integer usuarioIng; public Instant fechaIng = Instant.now();
        public Integer usuarioAct; public Instant fechaAct;
    }

    @Entity @Table(name = "evento_alerta", indexes = {@Index(columnList = "fechaHora")})
    public static class AlertEvent {
        @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long eventoId;
        @Column(nullable = false, length = 60) public String tipoEventoNombre;
        @Column(length = 500) public String descripcion;
        @Column(nullable = false) public Instant fechaHora = Instant.now();
        public Long alertaId; public Integer sensorId; public Integer comunidadId;
        public Integer tipoFenomenoId; public Integer nivelAlertaId;
        public Integer usuarioId;
    }
}
