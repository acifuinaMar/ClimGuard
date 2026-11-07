# PRUEBAS

> **Documento histórico — Fase 3 (noviembre de 2026).** Se conserva como registro de esa etapa: describe lo que se había implementado, probado y pendiente *en ese momento*. Varias afirmaciones (por ejemplo «no compilado» o «no ejecutado») quedaron superadas en la Fase 4. Documentación vigente de ClimGuard 4.1: [docs/README.md](../../README.md).


Entorno: contenedor Linux sin acceso a Maven/npm/NuGet/PyPI (proxy 403) y sin daemon Docker. Esto limita lo que se pudo ejecutar. Todo lo marcado «ejecutado» se corrió realmente en esta entrega; lo demás está en «NO ejecutado».

## Ejecutado, con resultado real

| Prueba | Cómo | Resultado |
|---|---|---|
| Evaluador Java (`RuleEvaluatorSelfTest`) | `javac` + `java` sobre `RuleEvaluator` (clase pura) | **48 verificaciones, 0 fallos**: 27 vectores de la semántica nueva, 12 de reglas legadas/mixtas, cooldown y «peligro ≠ alerta». |
| Mutación del evaluador | Cambiar `>=`/`<=` por `>`/`<` (nueva) y `<`/`>` por `<=`/`>=` (legada) | Falla en ambos casos (9 y 2 vectores): las pruebas detectan errores de frontera. |
| Spec de Angular (`peligro.spec.ts`) | Se ejecuta el archivo real con un shim mínimo de `describe/it/expect` en Node 22 (**no es Karma/Jasmine**) | **36 casos, 0 fallos**; con la mutación de la regla legada falla 1. |
| TypeScript estricto | `tsc --strict` sobre `peligro.ts`, `nivel-alerta.ts`, `peligro.spec.ts` | 0 errores. |
| TypeScript de componentes/servicios modificados | `tsc` con módulos `@angular/*`, `rxjs`, `leaflet` declarados como `any` | Sin errores propios (solo ruido de los stubs). Verifica sintaxis y referencias a modelos propios; **no** tipos de Angular. |
| Plantillas HTML modificadas | Script heurístico: identificadores usados en las plantillas vs. miembros de la clase | Sin identificadores desconocidos (regla-form, reglas-page, sensor-form, sensores-page). No sustituye a `ng build`. |
| Java sin Spring | `javac -proc:none` sobre los 9 archivos de `services/alert/src/main` | 379 errores, todos por paquetes/anotaciones de Spring/JPA ausentes; ninguno por símbolos del proyecto. Comprobación débil: **no** es una compilación real. |
| Servicio de reportes | `python -m unittest discover -s tests -t .` | **68 tests OK** (43 originales + 25 nuevos). Incluye: estampado sin inflar el PDF (regresión), `pypdf` no se importa con un trozo, defaults de producción (100 filas, `fail`, concurrencia 1, cola 4). |
| Auth y utilidades | `scripts/test-all.sh` | Auth 6/6 OK, Audit OK. El último paso del script (YAML de `k8s/`) falla porque esa carpeta no está en el ZIP: es del script original, no de este cambio. |
| `docker-compose.yml` | `docker compose -p climguard3 -f docker-compose.yml --env-file <valores falsos> config -q` | Válido. Resuelve `REPORT_MAX_ROWS=100`, `REPORT_ON_LIMIT=fail`, `REPORT_CONCURRENCY=1`, `MALLOC_ARENA_MAX=2`, `Migrations__AutoApply=true`; servicios: postgres, community-service, frontend, auth-service, gateway, edge, mongo, alert-service, audit-service, report-service, sqlserver, sensor-service; volúmenes: pgdata, sqldata, mongodata. No levanta contenedores. |
| Scripts SQL de PostgreSQL | PostgreSQL 16.15 temporal (clúster descartable en el entorno de trabajo, no su base) con el esquema ANTERIOR simulado de `regla_alerta` y `alerta` | `alert-001`: se aplica 2 veces sin error; reglas quedan `requiere_revision=true`, alertas históricas `semantica_regla=1`. `alert-002`: 8 borradores para 4 reglas, 2ª ejecución no duplica, 0 activos; equivalencia con la lógica anterior en 160.004 comparaciones (valores -200 a 200 con 2 decimales), **0 discrepancias**; corte y reversión transaccionales OK. |
| Ensamblado PDF aislado (trozos SUSTITUTOS, no WeasyPrint) | `python -m bench.bench_assembly --rows 100,500,1000,5000,10000 --chunk 250` (VmHWM reiniciado antes del ensamblado) | Ver tabla. |

### Ensamblado PDF aislado (trozos sustitutos de reportlab con fuente TrueType incrustada; **no** WeasyPrint)
| Filas | Trozo | Partes | Páginas | Tiempo | RSS pico durante el ensamblado (Δ) | Entrada | PDF final |
|---|---|---|---|---|---|---|---|
| 100 | 250 | 1 | 3 | ~0 s | +0,2 MB (no carga pypdf) | 26 KB | 26 KB |
| 500 | 250 | 2 | 16 | 0,11 s | +19,6 MB | 66 KB | 49 KB |
| 1000 | 250 | 4 | 32 | 0,12 s | +20,2 MB | 132 KB | 78 KB |
| 5000 | 250 | 20 | 160 | 0,31 s | +25,8 MB | 662 KB | 310 KB |
| 10000 | 250 | 40 | 320 | 0,60 s | +32,9 MB | 1323 KB | 600 KB |
| 5000 | 100 | 50 | 150 | 0,60 s | +28,3 MB | 1310 KB | 353 KB |

Lectura (válida solo para estos PDFs sustitutos): el ensamblado cuesta ≈ +20 MB fijos (importar `pypdf`, ≈24 MB) más ≈1,4–1,6 MB por cada 1000 filas; con trozos más pequeños sube algo el tiempo y la memoria. Antes de la corrección del sello el PDF final de 5000 filas pesaba 3020 KB (4,5× la entrada) y el ensamblado tardaba el doble.

## NO ejecutado (pendiente)
- Compilación y pruebas de .NET (sensor): `Models.cs`, `Pipeline.cs`, `Program.cs`, `SchemaUpgrades.cs` **sin compilar**; solo revisión manual.
- Compilación Maven/Spring del servicio de alertas, el arranque de Spring y el DDL de Hibernate (`columnDefinition`, `ddl-auto: update`). Los controladores y servicios Spring (`updateRule`, `convertirSemantica`, `classify`, cooldown con base de datos) no tienen pruebas; solo está probado el evaluador puro.
- `ng build` y `ng test` (Karma/Jasmine) de Angular; la plantilla y los componentes no se compilaron.
- **WeasyPrint real**: no hay mediciones de memoria/CPU/tiempo de PDFs reales (ni a 100 filas). El benchmark `bench.bench_report` y `bench.bench_assembly` están listos para correr en el contenedor.
- Docker: construcción de imágenes, healthchecks, arranque del stack.
- SQL Server: ni el script `sensor-001-origen.sql` ni `SchemaUpgrades` se ejecutaron.
- PostgreSQL real de producción: los scripts se probaron en un clúster temporal con un esquema simulado, no contra el esquema generado por Hibernate.
- MongoDB/GridFS (subida por bloques, descarga en streaming, purga): solo con el almacén en memoria de los tests.
- Respaldos (`pg_dump`, `BACKUP DATABASE`, `mongodump`): los comandos no se ejecutaron; solo se verificó el entrecomillado de los de SQL Server localmente.
- Flujos extremo a extremo (sensor físico por POST → alerta → SignalR → pantalla).

## Sobre el 502
**El arreglo del 502 NO está demostrado.** El diseño reduce el pico esperado, pero la causa raíz es una hipótesis (`mem_limit: 768m`, concurrencia 2 en la versión anterior, PDF monolítico) y no hay medición con WeasyPrint. Con `REPORT_MAX_ROWS=100` y trozos de 250, los reportes siguen generándose como un único documento, igual que antes: el ensamblado por trozos no se ejercita en producción hasta que se suba el límite. Ver `RECURSOS-VPS.md`.

## Cómo reproducir
```bash
bash scripts/test-all.sh                                                    # Python, Auth, evaluador Java
cd services/report && python3 -m unittest discover -s tests -t .
python3 -m bench.bench_assembly --rows 100,500,1000,5000 --chunk 250       # sin WeasyPrint usa sustitutos si hay reportlab
docker compose -p climguard3 -f docker-compose.yml exec report-service python -m bench.bench_assembly --rows 100,500,1000,5000
docker compose -p climguard3 -f docker-compose.yml exec report-service python -m bench.bench_report --rows 100,500,1000,5000
```
