# ClimGuard Web (Angular 22)

Interfaz web de ClimGuard 4.1. Es una aplicación de una sola página que consume la API a través del gateway (`/api`) y recibe actualizaciones en tiempo real por SignalR (`/hubs/monitoreo`).

## Estructura
```text
src/app/
├── app.routes.ts          rutas; cada pantalla exige un permiso (permisoGuard)
├── core/
│   ├── roles.ts           matriz de roles → permisos de la interfaz (RBAC)
│   ├── guards/            authGuard (sesión) y permisoGuard (permiso por ruta)
│   ├── interceptors/      añade el JWT a cada petición y cierra sesión ante 401
│   ├── services/          clientes HTTP por recurso, SignalR (tiempo real), alarma, reglas de peligro
│   ├── models/            tipos de datos de la API
│   ├── data/guatemala.ts  catálogo de departamentos y municipios
│   └── peligro.ts         evaluación de reglas en el cliente (espejo del evaluador del alert-service)
├── layout/                marco con menú lateral, encabezado y aviso de emergencia
└── features/              pantallas: auth, dashboard, mapa, sensores, comunidades, reglas, alertas,
                           historial, fenomenos, usuarios, reportes, bitacora
```

Los permisos de la interfaz solo ocultan opciones; la autorización real la aplica cada servicio del backend.

## Comandos
```bash
npm ci                                                   # dependencias exactas (package-lock.json)
npx ng serve                                             # desarrollo en http://localhost:4200
npx ng build --configuration production                  # salida en dist/climguard-web/browser
npx ng test --watch=false --browsers=ChromeHeadless      # pruebas unitarias (Karma + Jasmine)
```

## Configuración
| Archivo | `apiUrl` | Uso |
|---|---|---|
| `src/environments/environment.production.ts` | `/api` (mismo origen) | build de producción y de Docker |
| `src/environments/environment.ts` | URL absoluta del servidor | `ng serve` en desarrollo |

## Imagen y despliegue
`Dockerfile` construye la aplicación con Node 22 y la sirve con nginx (`nginx.conf`: rutas de Angular con `try_files`, caché de archivos con huella y cabeceras de seguridad). En producción la imagen es `climguard/frontend:<versión>` en K3s; ver [k8s/README.md](../../k8s/README.md).

Manual de uso de cada pantalla: [DOC-14 Manual de usuario](../../docs/DOC-14-Manual%20de%20usuario.md).
