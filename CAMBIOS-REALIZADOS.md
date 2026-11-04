# CAMBIOS-REALIZADOS — ClimGuard Fase 3 (estabilización)

Alcance: se corrigió sobre el ZIP recibido sin reescribir el proyecto. **Versión 2 de la entrega**: incorpora la revisión de integración (ver «Ronda 2» al final; reemplaza lo dicho antes sobre reglas «fuera de evaluación» y sobre `reportlab`). No se tocó el VPS, ni credenciales, ni datos. Las carpetas heredadas de Fase 2 (`backend/`, `ClimGuard Backend/`) no se modificaron. Los límites de lo verificado están en `PRUEBAS.md`.

## 0. Diagnóstico (basado en los archivos del ZIP)

| Tema | Hallazgo |
|---|---|
| Sensores | No existía distinción físico/simulado. El simulador (`Pipeline.cs`) generaba lecturas para **todo** sensor con `EstadoSensorId == 1`, incluidos los que reciben datos reales por POST. |
| Reglas | `RuleEvaluator` trataba `valorMin/valorMax` como rango **normal** y alertaba **fuera** de él. El front (`nivel-alerta.ts`) tenía umbrales propios y duplicados → dos fuentes de verdad. |
| Reportes | `REPORT_MAX_ROWS` se bajó a 100 para mitigar el 502. Con ese tope, los catálogos auxiliares (sensores, comunidades) también se truncaban en silencio a 100 (nombres/conteos erróneos). Los endpoints síncronos devolvían 502 ante cualquier fallo. El estado pasaba a PROCESSING aún esperando el semáforo. El PDF se armaba como un único documento WeasyPrint y se leía completo a memoria. |
| 502 (causa) | **Hipótesis, no medida**: `mem_limit: 768m`, concurrencia 2 y un documento WeasyPrint monolítico → OOM-kill del contenedor → el gateway responde 502. No pude correr WeasyPrint aquí. |

## 1. Sensores físicos vs simulados

| Archivo | Cambio |
|---|---|
| `services/sensor/Models.cs` | `OrigenSensor` (`FISICO`/`SIMULADO`, `EsValido`, `Normalizar`); `Sensor.Origen` (default FISICO, NOT NULL, longitud 10); `SensorDto` con `Origen`; `SensorInput.Origen` opcional con validación. |
| `services/sensor/Pipeline.cs` | El simulador solo genera para `EstadoSensorId == 1 && Origen == SIMULADO`. Los físicos siguen entrando por `POST /api/readings`; ambos usan el mismo pipeline (guardado, SignalR, evaluación de alertas). |
| `services/sensor/Program.cs` | Aplica `SchemaUpgrades` tras `EnsureCreated` (apagable con `Migrations:AutoApply=false`); siembra demo como SIMULADO; `GET /api/sensors?origen=`; POST usa FISICO si no se envía; PUT cambia origen solo si se envía. |
| `services/sensor/SchemaUpgrades.cs` (nuevo) | SQL aditivo e idempotente: agrega `Origen NVARCHAR(10) NOT NULL DEFAULT 'FISICO'` + check `CK_Sensor_Origen`. |
| `frontend/.../sensor.model.ts`, `sensor.service.ts` | Tipo `OrigenSensor`, `nombreOrigen`, envío de `origen`. |
| `features/sensores/*` | Select obligatorio de origen (vacío por defecto, con ayuda), columna y badge de origen. |

Origen y estado (activo/inactivo) son independientes; pueden convivir ambos tipos activos.
Decisión: los sensores existentes migran a **FISICO** (no se inventan datos simulados). Quien quiera que sus sensores demo vuelvan a simularse los cambia a SIMULADO desde la UI o con la plantilla SQL comentada (ver `MIGRACIONES.md`).

## 2. Semántica de reglas v2 (intervalo que activa)

Regla: se dispara si `valor >= min && valor <= max` (extremos incluidos). Ejemplo min=35, max=100: 20 no; 35, 65, 100 sí; 101 no.

Componentes afectados y tratados:
- **Evaluador Java** `RuleEvaluator.java`: `inInterval`, `evaluate` (mayor nivel gana; empate → menor id; solo reglas activas del mismo tipo), `suppressed` (cooldown por sensor+regla).
- **Entidades** `Entities.java`: `AlertRule.requiereRevision`, `Alert.semanticaRegla` (1 legado, 2 nuevo).
- **Repos / Servicio / Controlador** (ver Ronda 2 para la transición): `AlertService.evaluate` devuelve `Outcome(condicion, alerta, suprimidaPorCooldown)`. `/api/alerts/evaluate` mantiene `generated` y `alert` y agrega `condicionPeligro` y `suprimidaPorCooldown`. Nuevos: `GET /api/rules/classify?tipoSensorId=&valor=` y `GET /api/rules/pending-review`. Crear una regla siempre nace con la semántica nueva; editarla NO cambia la semántica de una legada salvo conversión explícita. Mensaje claro si min > max.
- **Seeds** (`Support.java`): reescritos a la semántica v2 (Temperatura elevada [35,100] n4; helada [-50,2] n3; Humedad baja [0,20] n3; Lluvia intensa [80,1000] n3; Nivel de río crítico [85,1000] n4).
- **Angular**: `core/peligro.ts` (espejo del evaluador Java) y `peligro.service.ts` (carga las reglas del backend, cache 60 s). `nivel-alerta.ts` ya no tiene umbrales propios; usa las reglas del backend. Dashboard, mapa y sensores cargan reglas antes de pintar. Reglas: banner de pendientes de revisión, badge "Requiere revisión", encabezado "Se activa entre", etiquetas "Mínimo (activa desde)/Máximo (activa hasta)" y texto de ayuda con el ejemplo 35–100. Validador de grupo `rangoInvalido`.
- **Reportes** (`catalog.py`): el umbral se imprime "entre X y Y" si `semanticaRegla==2`; para alertas legadas, "fuera de".
- **Pruebas**: `RuleEvaluatorSelfTest` (Java) y `peligro.spec.ts` (Angular) con los mismos 27 vectores.

**Condición de peligro ≠ alerta creada**: `condicionPeligro` indica si el valor está en una zona de peligro; `generated` indica si se creó una alerta nueva. El cooldown puede dar `condicionPeligro=true, generated=false, suprimidaPorCooldown=true`.

**Reglas existentes**: no se reinterpretan (ver «Ronda 2»): quedan LEGADAS y se siguen evaluando con su semántica original hasta una conversión explícita.
No se agregó un evento SignalR nuevo (`PeligroLectura`) para no sumar C# sin poder compilar; la distinción se expone vía `evaluate` y `classify`.

## 3. Reportes PDF (sin costo adicional de VPS)

| Archivo | Cambio |
|---|---|
| `app/config.py` | `REPORT_MAX_ROWS` (1000), `REPORT_ON_LIMIT` (`fail`\|`truncate`, def. `fail`), `REPORT_LOOKUP_MAX_ROWS` (5000), `REPORT_CHUNK_ROWS` (250), `REPORT_CONCURRENCY` (1), `REPORT_MAX_QUEUE` (4), `REPORT_TMP_DIR`, `REPORT_PDF_RETENTION_DAYS` (0). |
| `app/clients.py` | `ReportLimitError`; `get_all` falla de inmediato si `X-Total-Count` supera el límite (sin descargar más páginas); `get_lookup` para catálogos auxiliares con su propio tope. |
| `app/pdfbuild.py` (nuevo) | Dividir el documento en trozos, renderizar cada uno, unir con pypdf, numerar "Página X de N" con pypdf (sin reportlab), `gc` + `malloc_trim`. |
| `app/render.py`, `templates/report.html` | Cabecera/meta/advertencia solo en el primer trozo; pie solo en el último. |
| `app/store.py` | Subida a GridFS por bloques de 256 KiB desde archivo temporal; el PDF anterior se reemplaza solo si la subida fue exitosa; descarga en streaming; purga opcional por antigüedad. |
| `app/service.py` | Cola máxima (`ReportBusy` → HTTP 429 + `Retry-After`), semáforo antes de PROCESSING, códigos de error `LIMIT_EXCEEDED`/`UPSTREAM`/`INTERNAL`, temporales siempre borrados, limpieza de huérfanos al arrancar. |
| `app/main.py` | 429/422/502/500 según causa; descarga `StreamingResponse`; async preservado. |
| `bench/bench_report.py` (nuevo) | Benchmark reproducible 100/500/1000/5000 filas, modos `monolitico` y `trozos`. |
| `docker-compose.yml`, `.env.example` | Nuevas variables con valores conservadores (`REPORT_MAX_ROWS=100`); `MALLOC_ARENA_MAX=2`; `mem_limit` sigue en 768m. |

Nunca se trunca en silencio: por defecto, si se supera el tope, el reporte falla con `LIMIT_EXCEEDED` (HTTP 422) indicando límite y total, y sugiriendo acotar filtros (fechas, comunidad, sensor) o dividir por períodos. Con `REPORT_ON_LIMIT=truncate` se trunca y el PDF lo declara.
Compatibilidad: mismos endpoints y formato de respuesta; se agregan campos (`rowCount`, `truncated`, `pages`, `chunks`, `errorCode`).

## 4. Documentación
`docs/DOC-03-Reglas del Negocio.md` y `README_FASE3.md` con notas de la nueva semántica y el origen del sensor.

## 5. Lo que NO se hizo
OAuth/OIDC/K8s, cambios en el VPS, borrado de datos, rotación de credenciales, migraciones ejecutadas. No se quitó funcionalidad ni se alteraron endpoints públicos (solo se agregaron campos y 2 endpoints de lectura en alertas).

## Ronda 2 — revisión de integración (esta versión)

| # | Cambio | Archivos |
|---|---|---|
| 1 | **Transición de reglas sin hueco**: en la primera versión todas las reglas existentes quedaban fuera de evaluación (sin alertas hasta revisarlas) y guardar una regla legada la pasaba a la semántica nueva sin confirmación. Ahora las reglas legadas (`requiere_revision = true`) se evalúan con su semántica original (fuera de `[min,max]`); la nueva solo con conversión explícita (`PUT /api/rules/{id}?convertirSemantica=true`, casilla en el formulario, auditoría `RULE_SEMANTICS_CONVERTED`). | `RuleEvaluator.java` (`RuleView.legado`, `cumple`), `AlertService.java`, `AlertController.java`, `Entities.java`, `Repos.java`, `RuleEvaluatorSelfTest.java`, `peligro.ts`, `peligro.spec.ts`, `regla-alerta.service.ts`, `regla-form.*`, `reglas-page.*`, `regla-alerta.model.ts` |
| 2 | Script de borradores inactivos y plantillas de corte/reversión atómicos. | `scripts/migrations/alert-002-draft-rules.sql`, `alert-001-rule-semantics.sql` (texto) |
| 3 | **Caché de reglas del frontend**: vigencia 60 s → 15 s, y dashboard, mapa y sensores se repintan solos cuando las reglas cambian (consulta cada 15 s). | `peligro.service.ts`, `dashboard-page.ts`, `mapa-page.ts`, `sensores-page.ts` |
| 4 | **Ensamblado PDF**: el sello «Página X de N» con `merge_page` descomprimía cada página (≈20 KB en lugar de ≈1 KB): el PDF final crecía ≈4,5× (662 KB de trozos → 3 MB a 5000 filas con trozos sustitutos). Ahora se agrega un flujo comprimido pequeño por página (310 KB en la misma prueba). | `app/pdfbuild.py` |
| 5 | `reportlab` eliminado de `requirements.txt` (ya no se usa en el servicio; solo opcional para el benchmark de desarrollo). `pypdf` se importa solo si hay más de un trozo (importarlo cuesta ≈24 MB residentes); el conteo de páginas de un solo trozo ya no lo necesita. | `requirements.txt`, `app/pdfbuild.py` |
| 6 | `REPORT_MAX_ROWS=100` como valor inicial en código, `docker-compose.yml` y `.env.example`. | `config.py`, `docker-compose.yml`, `.env.example` |
| 7 | `Migrations__AutoApply` configurable desde `.env` (`SENSOR_MIGRATIONS_AUTOAPPLY`). | `docker-compose.yml` |
| 8 | `bench/bench_assembly.py`: mide solo el ensamblado final (RSS pico durante el ensamblado, CPU, tiempo, tamaño). Con WeasyPrint instalado genera los trozos reales. | `services/report/bench/` |
| 9 | Comandos de despliegue con `-p climguard3 -f docker-compose.yml`, nombres reales de servicios/volúmenes/bases, orden alertas→frontend, respaldos fuera del volumen. | `DESPLIEGUE-SEGURO.md` |
| 10 | Tests nuevos: vectores de reglas legadas/mixtas (Java y Angular), estampado sin inflar el PDF, `pypdf` no se carga en un trozo, defaults de producción. | tests |
