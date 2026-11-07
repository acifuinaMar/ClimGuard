# RECURSOS-VPS — reportes PDF sin aumentar el costo

> **Documento histórico — Fase 3 (noviembre de 2026).** Se conserva como registro de esa etapa: describe lo que se había implementado, probado y pendiente *en ese momento*. Varias afirmaciones (por ejemplo «no compilado» o «no ejecutado») quedaron superadas en la Fase 4. Documentación vigente de ClimGuard 4.1: [docs/README.md](../../README.md).


**No se midió con WeasyPrint real** (no estaba disponible). No se pidió más RAM ni se agregaron servicios. `mem_limit` del report-service sigue en 768 MB.

## Valor inicial de producción
`REPORT_MAX_ROWS=100` (default en `config.py`, `docker-compose.yml` y `.env.example`). Con 100 filas y trozos de 250, cada reporte se genera como **un solo documento WeasyPrint**, como antes; `pypdf` ni se carga. No suba el límite hasta completar las mediciones de abajo.

Comportamiento al superar el tope (`REPORT_ON_LIMIT=fail`, por defecto): el reporte termina en error `LIMIT_EXCEEDED` (HTTP 422) con el límite y el total de filas, y se sugiere acotar por fechas, comunidad o sensor, o generar varios períodos. **Cambio respecto a la versión anterior**, que recortaba y avisaba dentro del PDF; para conservar esa conducta: `REPORT_ON_LIMIT=truncate` (el PDF y el historial declaran el recorte).

| Variable | Inicial | Nota |
|---|---|---|
| `REPORT_MAX_ROWS` | 100 | Filas del conjunto principal. |
| `REPORT_ON_LIMIT` | `fail` | `truncate` = recorta y lo advierte. |
| `REPORT_CHUNK_ROWS` | 250 | Solo aplica si hay más filas que esto. Conjetura sin medir; bájelo a 100–150 si el pico por trozo resulta alto. |
| `REPORT_CONCURRENCY` | 1 | PDFs generándose a la vez. |
| `REPORT_MAX_QUEUE` | 4 | Pendientes+procesando; más → HTTP 429 con `Retry-After`. |
| `REPORT_LOOKUP_MAX_ROWS` | 5000 | Catálogos de apoyo (sensores/comunidades), independiente del tope principal. |

## Dónde se va la memoria (por inspección del código y mediciones parciales)
1. **Render de WeasyPrint**: candidato principal (maquetación completa del documento en memoria). No medido. El troceo la acota por trozo.
2. **Ensamblado final** (medido con trozos *sustitutos*, no WeasyPrint; ver `PRUEBAS.md`): ≈ +20 MB fijos por cargar `pypdf` (solo si hay más de un trozo) más ≈1,4–1,6 MB por cada 1000 filas; `PdfWriter` conserva todas las páginas hasta escribir el archivo, por lo que crece con el tamaño del PDF final. A 10 000 filas: +33 MB y 0,6 s con estos PDFs. Con PDFs reales de WeasyPrint puede ser distinto (fuentes incrustadas, imágenes): **mídalo**.
3. Recolección de datos y HTML: baratos (≈30–37 MB de RSS y <0,2 s CPU a 5000 filas, sin PDF).
4. Subida a GridFS en bloques de 256 KiB y descarga en streaming desde archivo temporal: no cargan el PDF completo a memoria.
Corrección de esta ronda: el sello «Página X de N» hacía crecer el PDF final ≈4,5× (se descomprimían las páginas); ya no.

## Medir antes y después (en el VPS, sin cambiar la configuración)
```bash
free -m; uptime
docker stats --no-stream
docker inspect -f '{{.State.OOMKilled}} {{.RestartCount}}' $(docker compose -p climguard3 -f docker-compose.yml ps -q report-service)
docker compose -p climguard3 -f docker-compose.yml exec report-service cat /sys/fs/cgroup/memory.peak      # pico del cgroup (cgroup v2)

# Benchmarks reproducibles dentro del contenedor (WeasyPrint real):
docker compose -p climguard3 -f docker-compose.yml exec report-service python -m bench.bench_report --rows 100,500,1000,5000
docker compose -p climguard3 -f docker-compose.yml exec report-service python -m bench.bench_assembly --rows 100,500,1000,5000

# Durante una generación real, en otra terminal:
docker stats report-service      # (use el nombre real del contenedor que muestre `docker compose -p climguard3 -f docker-compose.yml ps`)
```
Ejecútelos en una ventana de poco tráfico: el benchmark consume CPU y RAM del mismo VPS. `bench_report` compara los modos `monolitico` y `trozos`; `bench_assembly` aísla el ensamblado con los trozos reales que genere WeasyPrint.

Anote aquí los resultados reales antes de subir límites:

| Filas | Modo | Tiempo | CPU | RSS pico | ¿OOM? |
|---|---|---|---|---|---|
| 100 | | | | | |
| 500 | | | | | |
| 1000 | | | | | |
| 5000 | | | | | |

## Cómo subir el límite
1. Con 100 filas y la medición hecha, suba a 250 (aún un solo trozo) y mida pico y `OOMKilled`.
2. Para pasar de 250 filas se ejercita el troceo: mida con `bench_assembly` y `bench_report` y genere un reporte real de ese tamaño.
3. Criterio sugerido, a validar por usted: pico del contenedor bajo ≈60 % de 768 MB con un reporte en curso y `RestartCount` sin cambios.
4. `REPORT_CONCURRENCY=2` solo con evidencia de que dos PDFs simultáneos caben.

## Limitaciones conocidas del troceo
Cada trozo es un PDF independiente: puede quedar una página parcialmente vacía al final de cada trozo (cosmético; solo ocurre con más de 250 filas). El pie «Página X de N» se estampa al final.
