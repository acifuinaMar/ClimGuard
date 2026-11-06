-- =====================================================================================================
-- alert-002-draft-rules.sql  ·  PostgreSQL (base climguard_alert)  ·  IDEMPOTENTE · NO ACTIVA NADA
-- Estrategia de transición SIN hueco de alertas (ver MIGRACIONES.md):
--   · Las reglas LEGADAS (requiere_revision = true) siguen evaluándose con su semántica original (alerta FUERA de [min,max]).
--   · Este script crea, para cada regla legada, hasta DOS reglas BORRADOR con la semántica nueva (intervalo que ACTIVA):
--       zona baja  = [-1000000.00, min - 0.01]      zona alta = [max + 0.01, 1000000.00]
--     Son equivalentes a la lógica anterior para lecturas con 2 decimales. Los borradores nacen INACTIVOS (activo = false):
--     no generan alertas ni cambian nada hasta que un administrador los revise y los active.
--   · NO modifica ni desactiva reglas existentes. Ajuste el 0.01 y las cotas ±1000000 a la precisión y al rango físico del sensor.
--   · Las cotas extremas son un «infinito práctico»; si el sensor nunca llega a ese valor, la zona queda efectivamente abierta.
-- Requiere haber ejecutado antes alert-001-rule-semantics.sql. NO se ejecutó contra ninguna base real.
-- =====================================================================================================
BEGIN;

INSERT INTO regla_alerta (nombre, tipo_sensor_id, valor_min, valor_max, nivel_alerta_id, tipo_fenomeno_id, mensaje, activo, requiere_revision, usuario_ing, fecha_ing)
SELECT '[BORRADOR] ' || left(coalesce(r.nombre, r.mensaje), 60) || ' - zona baja (reemplaza #' || r.regla_alerta_id || ')',
       r.tipo_sensor_id, -1000000.00, r.valor_min - 0.01, r.nivel_alerta_id, r.tipo_fenomeno_id, r.mensaje, false, false, NULL, now()
FROM regla_alerta r
WHERE r.requiere_revision
  AND NOT EXISTS (SELECT 1 FROM regla_alerta d WHERE d.nombre LIKE '[BORRADOR]%- zona baja (reemplaza #' || r.regla_alerta_id || ')');

INSERT INTO regla_alerta (nombre, tipo_sensor_id, valor_min, valor_max, nivel_alerta_id, tipo_fenomeno_id, mensaje, activo, requiere_revision, usuario_ing, fecha_ing)
SELECT '[BORRADOR] ' || left(coalesce(r.nombre, r.mensaje), 60) || ' - zona alta (reemplaza #' || r.regla_alerta_id || ')',
       r.tipo_sensor_id, r.valor_max + 0.01, 1000000.00, r.nivel_alerta_id, r.tipo_fenomeno_id, r.mensaje, false, false, NULL, now()
FROM regla_alerta r
WHERE r.requiere_revision
  AND NOT EXISTS (SELECT 1 FROM regla_alerta d WHERE d.nombre LIKE '[BORRADOR]%- zona alta (reemplaza #' || r.regla_alerta_id || ')');

COMMIT;

-- 1) REVISIÓN (solo lectura): cada regla legada y sus borradores. Nada de esto está activo todavía.
SELECT r.regla_alerta_id AS legada_id, r.nombre AS legada, r.activo AS legada_activa,
       r.valor_min AS normal_min, r.valor_max AS normal_max, d.regla_alerta_id AS borrador_id, d.nombre AS borrador,
       d.valor_min AS zona_min, d.valor_max AS zona_max, d.activo AS borrador_activo
FROM regla_alerta r
JOIN regla_alerta d ON d.nombre LIKE '[BORRADOR]%(reemplaza #' || r.regla_alerta_id || ')'
WHERE r.requiere_revision
ORDER BY r.regla_alerta_id, d.regla_alerta_id;

-- 2) CORTE por regla (PLANTILLA, no se ejecuta sola). Una sola transacción: activa los borradores revisados y retira la legada
--    a la vez, así nunca hay un hueco ni dos reglas con el mismo significado. Sustituya los ids por los de la consulta anterior.
--    La regla legada NO se borra: queda inactiva (el historial de alertas conserva su snapshot). Reversible: reactivar la legada.
-- BEGIN;
--   UPDATE regla_alerta SET activo = true  WHERE regla_alerta_id IN (/* ids de borradores revisados */) AND NOT requiere_revision;
--   UPDATE regla_alerta SET activo = false WHERE regla_alerta_id = /* id de la legada */ AND requiere_revision;
-- COMMIT;

-- 3) REVERSIÓN del corte (plantilla): vuelve a la regla legada y desactiva los borradores.
-- BEGIN;
--   UPDATE regla_alerta SET activo = true  WHERE regla_alerta_id = /* id de la legada */ AND requiere_revision;
--   UPDATE regla_alerta SET activo = false WHERE regla_alerta_id IN (/* ids de borradores */);
-- COMMIT;

-- 4) VERIFICACIÓN de cobertura (solo lectura): reglas que hoy evalúan alertas, por tipo de sensor y semántica.
-- SELECT tipo_sensor_id, CASE WHEN requiere_revision THEN 'legada (fuera de min-max)' ELSE 'nueva (dentro de min-max)' END AS semantica,
--        count(*) AS reglas_activas
-- FROM regla_alerta WHERE activo GROUP BY 1, 2 ORDER BY 1, 2;

-- 5) LIMPIEZA de borradores que no se vayan a usar (solo si están inactivos): DELETE FROM regla_alerta WHERE nombre LIKE '[BORRADOR]%' AND NOT activo;
