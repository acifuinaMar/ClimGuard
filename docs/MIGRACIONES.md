# MIGRACIONES

Scripts SQL de ClimGuard (`scripts/migrations/`). Todos son **aditivos e idempotentes**: no borran ni reescriben datos y pueden ejecutarse más de una vez.

## Estado en producción (ClimGuard 4.1, K3s)
| Script | ¿Aplicado en producción? | Cómo |
|---|---|---|
| `auth-000-baseline.sql`, `auth-001-external-identities.sql` | **Sí** (2026-11-06) | `docker/postgres/init.sh` los ejecuta como el usuario `auth` al inicializar el PostgreSQL de K3s; tras restaurar los datos de la Fase 3, `scripts/k8s-restore.sh` vuelve a aplicar `auth-001`. |
| `sensor-001-origen.sql` (columna `Sensor.Origen`) | **Sí**, por la aplicación | El sensor-service ejecuta el mismo SQL al arrancar (`SchemaUpgrades.cs`, `Migrations__AutoApply=true`). Todos los sensores migrados quedaron `FISICO`; los de demostración se pasaron a `SIMULADO` desde la interfaz. |
| `alert-001-rule-semantics.sql`, `alert-002-draft-rules.sql` | **No verificado** | El alert-service usa Hibernate (`ddl-auto: update`). Compruebe el estado antes de ejecutarlos (consultas abajo). |

Comprobación (solo lectura) en K3s:
```bash
sudo kubectl -n climguard exec postgres-0 -- psql -U postgres -d climguard_auth  -c '\dt'
sudo kubectl -n climguard exec postgres-0 -- psql -U postgres -d climguard_alert -c "SELECT requiere_revision, activo, count(*) FROM regla_alerta GROUP BY 1,2"
```
Ejecutar un script en K3s: `sudo kubectl -n climguard exec -i postgres-0 -- psql -v ON_ERROR_STOP=1 -U postgres -d <base> < scripts/migrations/<script>.sql` (con respaldo previo, ver [k8s/README.md](../k8s/README.md) §5).

Los comandos equivalentes con Docker Compose (proyecto `climguard3`) están en [DESPLIEGUE-SEGURO.md](fases/fase-3/DESPLIEGUE-SEGURO.md) (histórico).

## Pruebas de cada script (Fase 3 y Fase 4, antes de producción)
| Script | Motor | Probado |
|---|---|---|
| `scripts/migrations/sensor-001-origen.sql` | SQL Server | **No** (no había SQL Server). El mismo SQL lo aplica `SchemaUpgrades.cs` al arrancar el sensor (sin compilar). |
| `scripts/migrations/alert-001-rule-semantics.sql` | PostgreSQL | Sí, en un PostgreSQL 16 temporal con el esquema anterior simulado: se aplica dos veces sin error; deja las reglas como legadas y las alertas históricas con `semantica_regla = 1`. **No** contra el esquema real de Hibernate. |
| `scripts/migrations/alert-002-draft-rules.sql` | PostgreSQL | Sí, mismo clúster temporal: idempotente (2ª ejecución no duplica), 0 borradores activos, equivalencia con la lógica anterior comprobada en 160.004 comparaciones (valores de -200 a 200 con 2 decimales, 4 reglas) con 0 discrepancias; corte y reversión probados. |
| `scripts/migrations/auth-000-baseline.sql` | PostgreSQL | Sí, en un PostgreSQL temporal: base nueva, dos ejecuciones sin error. Solo para bases nuevas con `DB_SYNCHRONIZE=false`; **no** comparado columna a columna contra lo que genera TypeORM. |
| `scripts/migrations/auth-001-external-identities.sql` | PostgreSQL | Sí, en un PostgreSQL temporal: sobre base nueva y sobre un esquema Fase 3 simulado con una fila en `external_identities` (se conserva); idempotente (2ª ejecución sin cambios); unicidad `(provider, subject)` y consumo atómico de códigos probados con 8 sesiones concurrentes. **No** contra la base real. |

## 0. Auth (Fase 4): identidades externas OAuth
Detalle en [FASE4_CAMBIOS.md](fases/fase-4/FASE4_CAMBIOS.md). Aditiva: completa `external_identities` y crea `oauth_flows` y `oauth_login_codes`. No toca `users` ni `roles`.

## 1. Sensores: físico vs simulado
- Agrega `dbo.Sensor.Origen NVARCHAR(10) NOT NULL DEFAULT 'FISICO'` + check `FISICO|SIMULADO`.
- Los sensores existentes quedan `FISICO`. **Consecuencia**: si en producción hay sensores de demostración que dependían del simulador, dejarán de recibir lecturas automáticas hasta pasarlos a `SIMULADO` (UI → Editar sensor, o la plantilla `UPDATE` comentada del script). Ningún dato se borra.
- El servicio la aplica solo al arrancar. Para controlarla a mano: `SENSOR_MIGRATIONS_AUTOAPPLY=false` en `.env` (variable nueva en `docker-compose.yml`) y ejecutar el script.

## 2. Reglas de alerta: transición sin hueco y sin reinterpretación

### Principio
Nunca se evalúa una regla antigua con la semántica nueva. Las reglas existentes quedan **legadas** (`requiere_revision = true`) y **siguen evaluándose exactamente como hasta ahora** (alerta cuando el valor queda FUERA de `[min,max]`). Así no hay período sin alertas. Pasan a la semántica nueva solo por una acción explícita.

### Estados de una regla
| Estado | `requiere_revision` | Se evalúa como |
|---|---|---|
| Legada | true | alerta si `valor < min` o `valor > max` (como antes) |
| Nueva | false | alerta si `valor >= min` y `valor <= max` |

Si coinciden varias reglas (legadas y nuevas), gana el nivel más alto y, a igual nivel, la de menor id; solo se crea **una** alerta por lectura. Las alertas llevan `semantica_regla` 1 (legada) o 2 (nueva); los reportes muestran "fuera de" o "entre" según corresponda.

### Fases
1. **Despliegue** (sin cambios de comportamiento): todas las reglas existentes quedan legadas y activas. La pantalla Reglas muestra un aviso con cuántas faltan convertir. Editar una regla legada sin marcar la casilla "Convertir a la semántica nueva" **no** cambia su significado.
2. **Preparar reemplazos** (sin efecto): ejecutar `alert-002-draft-rules.sql`. Crea, por cada regla legada, hasta dos borradores con la semántica nueva (zona baja `[-1000000, min-0.01]` y zona alta `[max+0.01, 1000000]`), **inactivos**. No toca las reglas existentes. El 0,01 y las cotas deben ajustarse a la precisión y rango físico del sensor.
3. **Revisar** (UI → Reglas): un administrador revisa cada borrador (intervalo, nivel, mensaje) con el responsable de negocio. Si una regla legada solo tenía sentido de un lado (por ejemplo, solo "demasiado caliente"), borre o deje inactiva la otra zona.
4. **Corte por regla** (atómico): en la plantilla del script, una transacción activa los borradores revisados y desactiva la legada a la vez. No hay hueco ni doble cobertura. La legada no se borra (queda inactiva) y el corte es reversible con la plantilla de reversión. También se puede hacer desde la UI: activar los borradores y desactivar la legada.
   - Alternativa por UI para una regla con un solo lado: editar la legada, marcar "Convertir a la semántica nueva" e indicar el intervalo que activa la alerta (el formulario no deja convertir sin cambiar el intervalo). Queda registrado `RULE_SEMANTICS_CONVERTED` en auditoría.
5. **Cierre**: cuando `SELECT count(*) FROM regla_alerta WHERE requiere_revision AND activo` sea 0, ya no quedan reglas con la semántica anterior en uso.

### Qué NO hace
- No activa reglas antiguas con la nueva semántica, ni convierte automáticamente, ni borra reglas.
- Cada regla debe ser revisada por una persona: los borradores son equivalentes a la lógica anterior solo para lecturas con 2 decimales, y la equivalencia no dice si el umbral anterior era el correcto.

### Rollback
Las columnas nuevas son inofensivas para la versión anterior. **Pero** la versión anterior interpreta TODAS las reglas como rango normal: tras el corte de cualquier regla (o crear reglas nuevas) un rollback del código invierte su significado. Para volver atrás: restaurar el respaldo de `regla_alerta` tomado antes del despliegue, o revertir los cortes (plantilla de reversión) y borrar las reglas nuevas.

## 3. Reportes
No requieren migración. `REPORT_MAX_ROWS=100` sigue siendo el valor inicial (ver [RECURSOS-VPS.md](fases/fase-3/RECURSOS-VPS.md); en producción K3s se usa 5000 filas y concurrencia 2, ver `scripts/gen-k8s.py`).
