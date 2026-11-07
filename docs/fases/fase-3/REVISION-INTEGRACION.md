# REVISION-INTEGRACION

> **Documento histórico — Fase 3 (noviembre de 2026).** Se conserva como registro de esa etapa: describe lo que se había implementado, probado y pendiente *en ese momento*. Varias afirmaciones (por ejemplo «no compilado» o «no ejecutado») quedaron superadas en la Fase 4. Documentación vigente de ClimGuard 4.1: [docs/README.md](../../README.md).


Qué se pudo comprobar y qué no, archivo por archivo. «Compilado» solo se usa cuando un compilador real lo procesó.

| Componente | Comprobación | Resultado | Límite |
|---|---|---|---|
| `RuleEvaluator.java` + test | `javac` + `java` | Compila; 48/48 | Clase pura |
| Resto de Spring (`AlertService`, `AlertController`, `Entities`, `Repos`, `Support`) | `javac -proc:none` | Solo errores por librerías ausentes; ninguno propio | **No compilado de verdad** |
| Sensor (.NET) | Lectura manual de los diffs contra el original | Sin errores evidentes: `SensorDto` solo se construye mediante `From`, `ImplicitUsings` cubre `ILogger`/`Task`, `GetValue("Migrations:AutoApply", true)` y raw strings son válidos en .NET 10 | **No compilado** (no hay SDK) |
| Frontend TypeScript | `tsc --strict` (archivos puros) y con stubs (componentes) | Sin errores propios | **No `ng build`**; plantillas con revisión heurística |
| Report (Python) | 68 tests | OK | WeasyPrint ausente: render real no probado |
| `docker-compose.yml` | `docker compose config` con valores falsos | Válido | Sin construir ni levantar |
| SQL PostgreSQL | PostgreSQL 16 temporal | OK | Esquema simulado, no el de Hibernate |
| SQL Server | — | **No probado** | — |

## Contratos entre archivos (verificados por lectura/pruebas)
- `GET /api/rules` devuelve la entidad completa → incluye `requiereRevision`; el frontend lo usa para evaluar legadas con su semántica. El gateway enruta `/api/rules/{**rest}`: `classify`, `pending-review` y `PUT /api/rules/{id}?convertirSemantica=true` pasan sin cambios.
- `POST /api/alerts/evaluate` conserva `generated` y `alert`; agrega `condicionPeligro` (con `semantica`) y `suprimidaPorCooldown`. El sensor-service no los consume y System.Text.Json ignora campos desconocidos: sin riesgo de deserialización.
- `Alert.semanticaRegla` (1/2) lo lee `catalog.py` del reporte para imprimir «fuera de» / «entre».
- Frontend ↔ backend: `PUT` lleva `convertirSemantica` solo cuando el administrador marca la casilla; `requiereRevision` jamás se envía en el cuerpo ni lo acepta el backend (se ignora).
- Sensor: `origen` viaja en POST/PUT; PUT sin `origen` no lo cambia. El simulador usa `Origen == SIMULADO` y estado activo.
- `docker-compose.yml`: nombres de servicios y volúmenes verificados; `SENSOR_MIGRATIONS_AUTOAPPLY` añadido para controlar la migración.

## Defectos de integración encontrados y corregidos en esta ronda
1. Transición de reglas: todo quedaba sin evaluar (sin alertas) y guardar una regla legada la convertía en silencio → rediseño (reglas legadas con su semántica, conversión explícita).
2. Un javadoc citaba un archivo de vectores inexistente → corregido.
3. Sello de páginas del PDF: inflaba el archivo 4,5× → corregido.
4. `reportlab` era dependencia del servicio solo para el sello → eliminada.
5. Orden de despliegue: un frontend nuevo ante un backend viejo evaluaría reglas antiguas con la semántica nueva → se documenta alertas antes que frontend.
6. Comandos de respaldo con la contraseña expandida en el host y `.bak` dentro del volumen protegido → corregido.
