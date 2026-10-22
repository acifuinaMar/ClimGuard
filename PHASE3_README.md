# ClimGuard — Fase 3: primera integración ejecutable (NO entrega completa)

Se conserva íntegro el código de Fase 2. Se agregan:
- API Gateway YARP en .NET 10 (ruta /api/* hacia API legada; /reports/* y /audit/* hacia servicios nuevos).
- Report Service FastAPI + Jinja2 + WeasyPrint, 4 tipos básicos de PDF desde endpoints de Fase 2.
- Audit Service FastAPI con MongoDB y control JWT.
- PostgreSQL y MongoDB en Docker Compose; PostgreSQL todavía NO tiene servicios propietarios.

## Ejecución local (no usar en el VPS actual de 2 GB)

1. Copiar `.env.example` a `.env`, configurar `MSSQL_SA_PASSWORD` y los parámetros de la API legada. Nunca subir `.env`.
2. Agregar en `.env` los valores `JWT_KEY`, `JWT_ISSUER`, `JWT_AUDIENCE`, `POSTGRES_PASSWORD`.
3. IMPORTANTE: los valores JWT deben coincidir con `Jwt:key`, `Jwt:Issuer`, `Jwt:Audience` de la API legada; de lo contrario, los reportes rechazarán los tokens. Revisar la emisión real de tokens antes de usar.
4. Ejecutar `docker compose -f docker-compose.yml -f docker-compose.phase3.yml config`.
5. Ejecutar `docker compose -f docker-compose.yml -f docker-compose.phase3.yml up -d --build` en equipo con RAM suficiente.
6. `curl http://localhost:4200/api/Sensor` puede devolver 401: esto demuestra el encaminamiento, no la autenticación.
7. `GET /reports/api/reports/types` con Authorization Bearer devuelve los tipos.
8. `POST /reports/api/reports/sensors` con token administrador descarga PDF; `GET /reports/api/reports/history` consulta metadata.
9. `POST /audit/api/audit` con JWT y body `{ "action":"TEST", "resource":"integration", "detail":{} }` crea evento.

## Limitaciones conocidas (NO presentar como completadas)

- No se han separado Auth, Community, Sensor y Alert en microservicios independientes.
- PostgreSQL está preparado, pero aún no aloja datos de servicios.
- El gateway valida JWT únicamente donde se agreguen políticas de autorización. En esta etapa, los endpoints legados validan JWT en su backend y Report/Audit en cada servicio.
- Report Service usa los endpoints de Fase 2; hay que verificar contratos de respuesta, paginación y permisos con datos reales.
- Solo hay 4 tipos básicos de reportes, no los 10 requerimientos RF-REP completos. Falta historial de descargas reales, filtros, reportes avanzados y el frontend.
- La API legada usa sus propios valores de configuración JWT. Alinear claves/issuer/audience antes de probar.
- No se ejecutaron compilaciones ni pruebas Docker en este entorno; validar antes de presentar.
- La configuración de YARP y el nginx del frontend son para integración local. Revisar la configuración Nginx del host del VPS.
- Para Fase 4 se requiere un proveedor de identidad OIDC, NO implementado.

## Prioridad de trabajo restante

1. Confirmar JWT y probar extremo a extremo Gateway -> API legada.
2. Implementar Auth Service NestJS con PostgreSQL y migración de usuarios.
3. Separar Sensor/Community a .NET 10 y mover Comunidad a PostgreSQL.
4. Reescribir Alert Service en Java/Spring Boot y PostgreSQL.
5. Completar 10 RF-REP, integrar UI Angular, auditar descargas.
6. Pruebas, despliegue VPS y documentación.
