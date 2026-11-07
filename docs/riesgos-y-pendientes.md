# Riesgos y pendientes — ClimGuard 4.1

Estado al 6 de noviembre de 2026. Reemplaza, para la versión vigente, al registro histórico de la Fase 3 ([RIESGOS-PENDIENTES.md](fases/fase-3/RIESGOS-PENDIENTES.md)), cuyos riesgos de compilación y despliegue quedaron resueltos al construir y desplegar la Fase 4.

## Seguridad — acciones recomendadas
| # | Hallazgo | Gravedad | Acción |
|---|---|---|---|
| S1 | La pantalla de inicio de sesión muestra de forma fija un **usuario y contraseña de prueba** (`features/auth/login-page.html`, pie de la tarjeta). Se ve también en producción. | **Alta** | Comprobar si ese usuario existe en producción y desactivarlo o cambiar su contraseña; quitar el pie del formulario en la próxima versión del frontend. |
| S2 | Las cuentas que vienen de la Fase 2 pueden conservar **contraseñas débiles** conocidas (las pruebas de `services/auth/test/common.test.ts` verifican hashes heredados de esas contraseñas). El auth-service convierte el hash antiguo (SHA-256 sin sal) a scrypt al iniciar sesión, pero la contraseña sigue siendo la misma. | **Alta** | Cambiar la contraseña de todos los usuarios migrados desde la pantalla Usuarios. |
| S3 | El historial público de Git contiene `appsettings.json` de la Fase 2 con credenciales en claro. | Media | No reutilizar esas credenciales en ningún entorno (pertenecen a un despliegue eliminado). Limpiar el historial exigiría reescribirlo. |
| S4 | El firmware del ESP8266 (fuera del repositorio) guarda la contraseña del Wi-Fi y la del usuario del dispositivo en texto plano. | Media | Rotarlas y moverlas a un archivo no versionado (`secrets.h`); a futuro, una credencial propia de dispositivo. |
| S5 | JWT HS256 con clave compartida por todos los servicios. | Baja-media | A futuro, RS256 con JWKS publicado por el auth-service. |
| S6 | El limitador por IP del gateway ve la IP del proxy (Traefik), no la del cliente (`KnownProxies` solo loopback). | Baja | Configurar las redes de confianza del proxy en `UseForwardedHeaders`. |

## Operación (K3s)
| # | Pendiente | Detalle |
|---|---|---|
| O1 | Renovación del certificado de Traefik | El Secret `climguard-tls` es una copia del certificado de Let's Encrypt (vence el 2027-01-05). No corta el servicio (el TLS público lo termina nginx del host), pero conviene un *deploy-hook* de certbot que lo actualice ([k8s/README.md](../k8s/README.md) §7). |
| O2 | Aislamiento de red | Docker Compose separaba cada base de datos en su propia red; en K3s no hay NetworkPolicies. El auth-service necesita salida HTTPS a Google y GitHub. |
| O3 | Respaldos | Se ejecutan a mano ([k8s/README.md](../k8s/README.md) §5); no hay tarea programada ni copia fuera de la VPS automatizada. |
| O4 | Un solo nodo | Sin alta disponibilidad: una caída de la VPS detiene el servicio. |
| O5 | Recuperación de la Fase 3 | Los contenedores y volúmenes de Docker Compose de la Fase 3 siguen detenidos en la VPS como respaldo (`scripts/rollback-fase3.sh`). Decidir cuándo retirarlos. |
| O6 | Límites de reportes | Producción usa `REPORT_MAX_ROWS=5000` y `REPORT_CONCURRENCY=2` (como en la Fase 3), por encima de los valores conservadores sugeridos en [RECURSOS-VPS.md](fases/fase-3/RECURSOS-VPS.md). Vigilar reinicios del pod `report-service`. |
| O7 | Claves de DataProtection de .NET | No persisten entre reinicios (aviso en los logs); hoy sin impacto funcional. |

## Datos
| # | Pendiente | Detalle |
|---|---|---|
| D1 | Reglas de alerta legadas | No está verificado si `alert-001`/`alert-002` se aplicaron en producción ni cuántas reglas siguen con la semántica anterior. Revisarlas ([MIGRACIONES.md](MIGRACIONES.md) §2). |

## Funcionalidad
| # | Pendiente | Detalle |
|---|---|---|
| F1 | Eliminar sensores | La API lo permite (`DELETE /api/sensors/{id}`, Administrador) pero la opción está deshabilitada en la interfaz; se usa activar/desactivar. |
| F2 | Cerrar alertas | La API ofrece `POST /api/alerts/{id}/close`; la interfaz solo permite **Atender**. |
| F3 | Identidades externas | No hay pantalla para listar ni desvincular cuentas de Google o GitHub; no hay *refresh token*. |
| F4 | Campo «Valor actual» del formulario de sensores | Es editable, pero el sensor-service no lo recibe (`SensorInput` no tiene ese campo): lo que se escriba no se guarda. Convertirlo en solo lectura o quitarlo. |
| F5 | Contraseña al editar usuarios | El formulario exige escribir una contraseña también al editar (por ejemplo, solo para cambiar el rol). |

## Calidad
| # | Pendiente | Detalle |
|---|---|---|
| Q1 | Pruebas de gateway, community y sensor | Solo se compilan en CI; no tienen pruebas unitarias. |
| Q2 | Pruebas extremo a extremo | No automatizadas; se hicieron de forma manual (ver [pruebas.md](pruebas.md)). |
| Q3 | Pruebas de controladores Spring | Solo el evaluador de reglas tiene pruebas. |
