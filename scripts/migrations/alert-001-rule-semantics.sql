-- =====================================================================================================
-- alert-001-rule-semantics.sql  ·  PostgreSQL (base climguard_alert)  ·  ADITIVA e IDEMPOTENTE
-- Cambio de semántica: min/max dejan de ser el rango NORMAL y pasan a ser el intervalo que ACTIVA la alerta
-- (valor >= min AND valor <= max, extremos incluidos).
--
-- Hibernate (DB_DDL_AUTO=update) crea estas dos columnas solo al arrancar la nueva versión. Use este script si prefiere
-- aplicarlas a mano antes de desplegar. NO se ejecutó contra ninguna base real.
-- Antes: respaldo (ver DESPLIEGUE-SEGURO.md).
--
-- IMPORTANTE: NO reinterpreta ni modifica valor_min/valor_max. Las reglas existentes quedan marcadas requiere_revision = true
-- («LEGADAS») y SIGUEN EVALUÁNDOSE con su semántica original (alerta FUERA de [min,max]), de modo que el sistema no se queda sin
-- alertas durante la transición. Nunca se evalúan con la semántica nueva salvo conversión explícita de un administrador
-- (UI: casilla «Convertir a la semántica nueva»; API: PUT /api/rules/{id}?convertirSemantica=true) o corte SQL manual
-- (alert-002-draft-rules.sql). Probado contra PostgreSQL 16 en un clúster temporal (ver PRUEBAS.md); NO contra su base real.
-- =====================================================================================================
BEGIN;

-- 1) Reglas: las existentes quedan como LEGADAS (se evalúan como antes); las nuevas las crea la API con false (semántica nueva).
ALTER TABLE regla_alerta ADD COLUMN IF NOT EXISTS requiere_revision boolean DEFAULT true;
UPDATE regla_alerta SET requiere_revision = true WHERE requiere_revision IS NULL;

-- 2) Alertas históricas: se generaron con la semántica anterior (1 = "fuera del rango normal"); las nuevas llevan 2.
ALTER TABLE alerta ADD COLUMN IF NOT EXISTS semantica_regla smallint DEFAULT 1;
UPDATE alerta SET semantica_regla = 1 WHERE semantica_regla IS NULL;

COMMIT;

-- 3) REVISIÓN (solo lectura): reglas legadas y una PROPUESTA de zonas de peligro equivalentes a la lógica anterior.
--    Antes: alerta si valor < min  o  valor > max.   Ahora cada zona es un intervalo cerrado. Las cotas ±1000000 son un
--    "infinito práctico"; ajústelas al rango físico del sensor. Es solo una sugerencia: alert-002-draft-rules.sql la convierte en BORRADORES inactivos, o créelas desde la UI.
SELECT regla_alerta_id AS regla_id, nombre, tipo_sensor_id, valor_min AS min_anterior, valor_max AS max_anterior,
       nivel_alerta_id, activo,
       -1000000.00::numeric       AS propuesta_bajo_desde,  (valor_min - 0.01) AS propuesta_bajo_hasta,
       (valor_max + 0.01)         AS propuesta_alto_desde,  1000000.00::numeric AS propuesta_alto_hasta
FROM regla_alerta
WHERE requiere_revision
ORDER BY regla_alerta_id;

-- 4) Estado final esperado tras convertir/retirar todas las legadas (pendientes = 0):
-- SELECT count(*) FILTER (WHERE requiere_revision) AS pendientes, count(*) AS total FROM regla_alerta;

-- =====================================================================================================
-- ROLLBACK
-- La versión anterior de la aplicación interpreta min/max como rango NORMAL. Si ya revisó reglas bajo la nueva semántica, esas
-- reglas quedarían INVERTIDAS en la versión anterior. Por eso el rollback correcto es restaurar el respaldo de regla_alerta
-- tomado antes del despliegue (DESPLIEGUE-SEGURO.md). Las columnas nuevas son inofensivas para la versión anterior:
--   ALTER TABLE regla_alerta DROP COLUMN IF EXISTS requiere_revision;   -- opcional
--   ALTER TABLE alerta       DROP COLUMN IF EXISTS semantica_regla;      -- opcional
-- =====================================================================================================
