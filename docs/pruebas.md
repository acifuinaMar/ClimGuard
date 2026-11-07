# Pruebas — ClimGuard 4.1

Resultados de la versión vigente. El registro de lo que se pudo probar en la Fase 3 (sin compiladores ni Docker) está en [fases/fase-3/PRUEBAS.md](fases/fase-3/PRUEBAS.md).

## Pruebas automáticas
| Suite | Qué cubre | Comando | Resultado (v4.1) |
|---|---|---|---|
| Frontend (Karma + Jasmine) | Evaluador de reglas de peligro (`peligro.spec.ts`, mismos vectores que el evaluador Java) y comportamiento de la raíz y del guard de sesión (`app.spec.ts`) | `cd frontend/climguard-web && npx ng test --watch=false --browsers=ChromeHeadless` | **40 / 40** |
| Build de producción Angular | Compilación y presupuestos | `npx ng build --configuration production` | Compila (avisos de presupuesto de estilos) |
| Report (unittest) | Filtros, límites, troceo y ensamblado de PDF, almacén GridFS en memoria, colas, seguridad JWT | `cd services/report && python -m unittest discover -s tests -t .` | **68 / 68** |
| Audit (unittest) | Lógica de eventos y bitácora | `cd services/audit && python -m unittest discover -s tests -t .` | **4 / 4** |
| Auth + OAuth (node:test) | JWT, contraseñas, contrato del login (incluido el que usa el ESP8266), PKCE, `state`/`nonce`, canje de código de un solo uso, Google y GitHub con proveedores simulados | `bash scripts/test-all.sh` | **41 / 41** |
| Alert (evaluador de reglas) | Semántica de intervalos, reglas legadas y mixtas, cooldown, «peligro ≠ alerta» | `bash scripts/test-all.sh` | **48 comprobaciones, 0 fallos** |
| Manifiestos | `scripts/gen-k8s.py` reproduce exactamente `k8s/climguard.yaml` y `k8s/traefik-config.yaml`; sin `Secret` en los manifiestos | `python scripts/gen-k8s.py && git diff --exit-code k8s/` | Sin diferencias |
| Docker Compose | Sintaxis y resolución de variables de `docker-compose.yml` y `docker-compose.oauth.yml` | `docker compose --env-file <.env> config -q` | Válido |

`scripts/test-all.sh` ejecuta Report, Audit, Auth, Alert y la sintaxis YAML en una sola orden (requiere Python con las dependencias de `services/report` y `services/audit`, Node con `services/auth/node_modules` y un JDK 21).

## Integración continua
El flujo [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) se ejecuta en cada *push* y *pull request*. Ver su estado y alcance en la sección [Integración continua](#estado-de-la-integración-continua).

## Pruebas funcionales en producción
Realizadas sobre `https://climguard.acifuina.online` durante el despliegue de la Fase 4 y la versión 4.1.

| Prueba | Quién | Resultado |
|---|---|---|
| HTTPS, redirección HTTP→HTTPS, cabeceras de seguridad (HSTS, nosniff, SAMEORIGIN, Referrer-Policy) | Claude Code (verificación con `curl`) | Correcto |
| Endpoints de todos los servicios con un JWT temporal de administrador (comunidades, sensores, lecturas, alertas, reglas, reportes, auditoría) | Claude Code | 200 en todos |
| Descarga de un PDF migrado (GridFS) y generación de uno nuevo; reporte que supera el límite → 422 `LIMIT_EXCEEDED` | Claude Code | Correcto |
| Puertos internos no expuestos a Internet (API de K3s, NodePorts, bases de datos) | Claude Code | Cerrados |
| Migración de datos de la Fase 3 (usuarios, comunidades, sensores, ~1 M de lecturas, alertas, reportes, auditoría) | Claude Code (conteos antes y después) | Conteos idénticos |
| Inicio de sesión con Google y con GitHub | Equipo | Correcto |
| Panel en tiempo real con lecturas de sensores ESP8266 físicos | Equipo | Correcto |
| Simulador de lecturas tras clasificar los sensores de demostración como *Simulado* | Equipo | Correcto |
| Funcionamiento general de la versión 4.1 en producción tras actualizar el frontend (incluye los desplegables de comunidad y de departamento/municipio) | Equipo | Confirmado por el equipo al cerrar la versión |

## No cubierto
Pruebas unitarias de gateway, community y sensor (solo compilación), controladores Spring y pruebas extremo a extremo automatizadas. Ver [riesgos-y-pendientes.md](riesgos-y-pendientes.md) (Q1–Q3).
