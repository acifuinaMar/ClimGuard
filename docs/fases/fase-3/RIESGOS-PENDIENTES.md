# RIESGOS-PENDIENTES

> **Documento histórico — Fase 3 (noviembre de 2026).** Se conserva como registro de esa etapa: describe lo que se había implementado, probado y pendiente *en ese momento*. Varias afirmaciones (por ejemplo «no compilado» o «no ejecutado») quedaron superadas en la Fase 4. Documentación vigente de ClimGuard 4.1: [docs/README.md](../../README.md).


Informe de lo que **no está resuelto o no está probado**. Ordenado por gravedad.

| # | Riesgo | Gravedad | Estado | Cómo reducirlo |
|---|---|---|---|---|
| 1 | **Compilación no verificada** de .NET, Spring, Angular y de las imágenes Docker. Puede haber errores que no vi. | Alta | Sin probar | Construir primero las imágenes en un entorno de prueba (`docker compose -p <otro-nombre> build ...`, nunca contra los volúmenes de `climguard3`) antes del despliegue. Una construcción en el VPS pequeño puede agotar RAM. |
| 2 | **El 502 no está demostrado como resuelto.** Causa raíz sin medir; WeasyPrint real no se probó. | Alta | Sin probar | Correr `bench_report` y `bench_assembly` en el VPS (`RECURSOS-VPS.md`) y observar `OOMKilled`. Mantener `REPORT_MAX_ROWS=100`. |
| 3 | **Cambio de comportamiento en reportes grandes**: con `REPORT_ON_LIMIT=fail`, un reporte de más de 100 filas ahora termina en error 422 (antes se recortaba con aviso). | Media-alta | Decisión de diseño | Aceptarlo o poner `REPORT_ON_LIMIT=truncate`. Avisar a los usuarios. |
| 4 | **Sensores existentes pasan a FISICO**: los de demostración dejan de recibir lecturas simuladas. | Media-alta | Esperado | Pasar a SIMULADO los que lo sean (UI o SQL). Revisar con la consulta del script. |
| 5 | **Las reglas legadas conservan su comportamiento anterior, correcto o no.** Si en producción alguien ya cargó intervalos pensando en «zona de peligro» (por ejemplo 35–100 para fiebre alta) con la semántica vieja, hoy alertan al revés y seguirán haciéndolo hasta convertirlas. No asumí que los valores actuales sean correctos. | Alta | Requiere revisión humana | Revisar TODAS las reglas reales con el responsable de negocio (`MIGRACIONES.md` fases 2–4). |
| 6 | **Conversión de reglas**: los borradores son equivalentes a la lógica anterior solo para lecturas con 2 decimales y usan cotas ±1 000 000 como «infinito». Sensores con más precisión pueden tener lecturas en el hueco de 0,01. | Media | Probado en PostgreSQL temporal | Ajustar el 0,01 y las cotas al sensor antes de activar. |
| 7 | **Coexistencia legadas + nuevas**: mientras haya ambas del mismo tipo, gana el nivel más alto y a igual nivel el menor id; puede atribuirse la alerta a la regla legada en lugar de la nueva. El corte atómico lo evita. | Media | Cubierto por vectores | Hacer cortes por regla, en una transacción. |
| 8 | **Rollback tras convertir reglas**: la versión anterior invertiría las reglas nuevas. | Alta si ocurre | Documentado | Respaldo de `regla_alerta` antes de empezar; plantilla de reversión. |
| 9 | **Hibernate `ddl-auto: update`** con `columnDefinition` no probado contra el esquema real. | Media | Sin probar | Ejecutar `alert-001` **antes** de levantar la nueva imagen de alertas (así no depende de Hibernate). |
| 10 | **SQL Server**: ni el script ni `SchemaUpgrades` se ejecutaron. `ALTER TABLE ... ADD ... NOT NULL DEFAULT` sobre `Sensor` es pequeño, pero no se vio. | Media | Sin probar | Respaldo + `sensor-001` manual (`SENSOR_MIGRATIONS_AUTOAPPLY=false`) en una ventana controlada. |
| 11 | **Respaldos no ejecutados**: `mongodump` puede no estar en la imagen; el `.bak` se crea dentro del volumen y debe copiarse fuera. | Media | Sin probar | Probar un respaldo y una restauración en un entorno de prueba antes de depender de ellos. |
| 12 | **Orden de despliegue**: frontend antes que alertas muestra colores con la semántica equivocada. | Media | Documentado | Seguir el orden de `DESPLIEGUE-SEGURO.md`. |
| 13 | **Caché de reglas del frontend**: hasta ≈15 s de diferencia entre un cambio de umbral y la pantalla; los colores de pantalla son un cálculo del cliente, la alerta real la decide el backend. No hay evento SignalR de «peligro». | Baja-media | Mitigado (60 s→15 s + repintado) | Si se necesita inmediatez, añadir un evento SignalR (requiere C# adicional sin compilar aquí). |
| 14 | **Ensamblado PDF medido solo con PDFs sustitutos.** El `PdfWriter` conserva todas las páginas hasta escribir; con PDFs reales el consumo puede diferir. | Media | Parcial | `bench_assembly` en el contenedor. Con 100 filas no se ejercita. |
| 15 | **Troceo**: cada trozo termina en página nueva (cosmético) y el sello de páginas usa API privada `PdfWriter._add_object` de `pypdf==5.9.0`. Una actualización de `pypdf` puede romperlo; hay un test de regresión. | Baja | Probado en tests | No actualizar `pypdf` sin correr los tests. |
| 16 | **Sin pruebas automáticas** de controladores/servicios Spring ni de C#. Solo el evaluador puro (Java) y el servicio de reportes (Python) tienen tests ejecutados. | Media | Sin probar | Añadir pruebas de integración con la CI del proyecto. |
| 17 | **Peticiones HTTP concurrentes/ colas** del reporte (429, semáforo) probadas con almacén en memoria, no con MongoDB real. | Baja-media | Parcial | Prueba de carga corta en entorno de prueba. |
| 18 | El script `scripts/test-all.sh` original referencia `k8s/climguard.yaml`, ausente del ZIP. | Baja | Preexistente | Quitar ese paso o restaurar la carpeta. |

## Requisitos pedidos y su estado
| Pedido | Estado |
|---|---|
| 1. Compilación / integración | Parcial: ver `REVISION-INTEGRACION.md` (no compilados: .NET, Spring completo, Angular, Docker) |
| 2. Migración de reglas sin hueco, sin activar antiguas con la semántica nueva | Implementado y probado en evaluadores (Java/TS) y en PostgreSQL temporal; **sin probar** Spring/Hibernate ni producción |
| 3. Memoria del ensamblado PDF | Medido con trozos sustitutos; defecto de tamaño corregido; **sin medir con WeasyPrint** |
| 4. `REPORT_MAX_ROWS=100` inicial | Hecho (código, compose, `.env.example`, docs) |
| 5. Comandos con `climguard3`, nombres y rutas verificados | Hecho contra `docker-compose.yml`; comandos **no ejecutados** |
| 6. Caché de reglas del frontend | Reducida a 15 s con repintado automático; sin `ng build` |
| 7. Dependencias de Python | `pypdf==5.9.0` es la única dependencia nueva (en requirements; el Dockerfile la instala con `pip install -r`); `reportlab` eliminado; `pypdf` carga ≈24 MB solo con varios trozos |
