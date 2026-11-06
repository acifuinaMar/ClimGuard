# ClimGuard Fase 3 — estado del código recibido y mejoras

## Código encontrado en proyecto3
- Monolito Fase 2 .NET + SQL Server y frontend Angular.
- Gateway YARP .NET 10, Report FastAPI + MongoDB, Audit FastAPI + MongoDB.
- Docker Compose base y override parcial de Fase 3.

## Mejoras de esta entrega
- Gateway exige JWT válido en rutas proxificadas salvo login, aplica límite de peticiones y conserva el hub SignalR.
- Nginx encamina SignalR al Gateway y elimina rutas /reports y /audit que no tenían correspondencia con las rutas de YARP.
- Report Service conserva los PDF generados en MongoDB GridFS y permite volver a descargarlos mediante `GET /api/reports/{reportId}/download`; registra descargas.
- Audit Service usa un objeto independiente para `detail` en cada solicitud.

## Bloqueos conocidos (NO considerar Fase 3 finalizada)
- No existen microservicios independientes Auth/NestJS, Community/.NET+Postgres, Sensor/.NET+SQL Server, Alert/Java+Postgres.
- Los reportes siguen consultando endpoints del monolito; únicamente hay cuatro tipos genéricos, no los diez requisitos completos.
- Las rutas reales de Login deben comprobarse frente a los controladores y la UI; los tokens deben usar la misma clave, issuer y audience.
- El `docker-compose.phase3.yml` es un override y se ejecuta junto al `docker-compose.yml`; este último expone los puertos 8080 y 1433 del monolito/SQL Server y deben cerrarse antes de producción.
- No se ha ejecutado `dotnet build`, `docker compose` ni pruebas end-to-end en este entorno.

## Comando de integración (solo ambiente de pruebas)
`docker compose -f docker-compose.yml -f docker-compose.phase3.yml --env-file .env config`

No subir este paquete directamente a producción sin pruebas y copia de seguridad.
