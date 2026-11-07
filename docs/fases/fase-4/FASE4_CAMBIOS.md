# FASE 4 — Autenticación externa (OAuth 2.0 / OIDC)

> **Registro de la Fase 4 — diseño de OAuth 2.0 / OIDC (noviembre de 2026).** El diseño, el flujo y las reglas de seguridad siguen vigentes en ClimGuard 4.1. Quedaron superados: la nota de que la Fase 4 «no se declara terminada», las instrucciones con ZIP (§8 y §11) y la mención de K3s como trabajo pendiente (ver [K3S_PROGRESS.md](K3S_PROGRESS.md)). Documentación vigente: [docs/README.md](../../README.md).


Alcance de esta entrega: **solo autenticación externa** (Google por OIDC, GitHub por OAuth 2.0) sobre el Auth Service, más Gateway y Angular.
**No se declara terminada la Fase 4**: Kubernetes/K3s corresponde a otros integrantes y varias verificaciones requieren tu Docker (sección 9).

Base: `ClimGuard-fase3-estabilizacion.zip`. Fase 3 no se reescribió; no se eliminó ninguna funcionalidad; **Sensor, Community, Alert, Audit y Report no se tocaron**.

---

## 1. Qué se implementó

| Requisito | Implementación |
|---|---|
| Login local intacto | `POST /api/auth/login` y `/api/login` sin cambios de contrato (JSON de entrada y salida idénticos). Test de contrato incluido. |
| Google (OIDC) | Authorization Code + **PKCE S256** + **state** + **nonce**. ID Token validado con **`jose`**: firma contra el JWKS de Google (solo RS256), `iss`, `aud` (= tu Client ID), `exp`/`nbf`; el servicio comprueba además el `nonce` y `email_verified`. |
| GitHub (OAuth 2.0) | GitHub no es OIDC (no hay ID Token ni nonce). Authorization Code + **state** + PKCE. Identidad = `id` numérico de `/user`; correo = solo el **primario y verificado** de `/user/emails`. |
| Extensible | Interfaz `OAuthProvider` (`buildAuthUrl` / `completeLogin`). Un proveedor nuevo = una clase + registrarla en `oauth.service.ts`. |
| JWT propio, roles | Tras el login externo se emite **el mismo JWT HS256 de ClimGuard** (mismos claims) → Gateway y microservicios no cambian. |
| JWT fuera de la URL | El callback redirige a `/auth/callback#code=<código de un solo uso>`; Angular lo canjea por **POST**. El JWT nunca viaja en una URL. |
| Código temporal | 32 bytes aleatorios, guardado **hasheado (SHA-256)**, vida 60 s (`OAUTH_CODE_TTL_SECONDS`), consumo **atómico** (`UPDATE … RETURNING` en una sentencia), **ligado al navegador** que inició el flujo mediante cookie `httpOnly`. |
| Vinculación segura | Una identidad se identifica por `(provider, subject)`, **nunca por correo**. No existe vinculación automática a cuentas locales. Vincular exige sesión local activa (`POST /api/auth/oauth/{proveedor}/link`, con Bearer). |
| Registro automático | `OAUTH_AUTO_PROVISION` (por defecto **false**). Si es `true`: usuario nuevo con rol **Consulta**, fijo en código (no configurable), solo con correo verificado, y opcionalmente restringido por `OAUTH_ALLOWED_EMAIL_DOMAINS`. |
| Nunca ADMIN | Ninguna ruta de OAuth asigna Administrador ni Operador. El ascenso lo hace una persona desde la pantalla de Usuarios. |
| Sin secretos | Ni en el ZIP ni en el frontend. El `client_secret` solo existe en el backend (variables de entorno). El frontend no guarda credenciales OAuth. |
| Rutas anónimas mínimas | Gateway: solo `providers`, `{proveedor}/start`, `{proveedor}/callback` (GET) y `exchange` (POST), con limitador `oauth` (30/min por IP, `RateLimit:OAuthPerMinute`). `link` sigue autenticada (cae en la ruta `auth` existente). |
| Migraciones SQL idempotentes | `scripts/migrations/auth-001-external-identities.sql` (+ `auth-000-baseline.sql` para bases nuevas sin `synchronize`). |
| Auditoría | `OAUTH_LOGIN`, `OAUTH_LOGIN_FAILED`, `OAUTH_USER_PROVISIONED`, `OAUTH_IDENTITY_LINKED` hacia Audit Service (mismo canal que el login local). |

### Roles: equivalencias (sin cambiar contratos)
| ClimGuard (BD, JWT, .NET, Java, Python, Angular) | Equivalente en la especificación |
|---|---|
| `Administrador` | ADMIN |
| `Operador` | OPERATOR |
| `Consulta` | VIEWER |

### Flujo
```
Angular /login ──GET /api/auth/oauth/providers──► botones según proveedores configurados
Botón ──navegación──► GET /api/auth/oauth/google/start
   Auth: genera state, nonce, code_verifier, binding → guarda HASH(state) y datos en oauth_flows
         Set-Cookie cg_oauth_bind (httpOnly, SameSite=Lax, Path=/api/auth/oauth, Secure si https) → 302 a Google
Google ──302──► GET /api/auth/oauth/google/callback?code&state
   Auth: consume el flujo (atómico, mismo navegador, no expirado) → canje del code con client_secret + code_verifier
         valida ID Token (jose) + nonce → identidad → código de un solo uso (hash) → 302 /auth/callback#code=…
Angular /auth/callback: borra el fragmento, POST /api/auth/oauth/exchange {code} (con cookie)
   Auth: consume el código (atómico, mismo navegador) → JWT de ClimGuard (mismo JSON que el login local + nombreCompleto)
```
Errores: siempre `302 /login?oauth_error=<motivo fijo>` (`not_registered`, `account_disabled`, `email_not_verified`, `domain_not_allowed`, `identity_in_use`, `invalid_state`, `invalid_token`, `provider_error`, `provider_unavailable`, `unknown_provider`). Nunca se muestra texto del proveedor.

---

## 2. Decisión de arquitectura que necesita tu confirmación (salida a Internet del Auth Service)

En Fase 3 la red `services` es `internal: true` (sin salida a Internet por diseño). El Auth Service **debe** llamar a Google y GitHub desde el servidor (canje del código, JWKS, API de GitHub). Sin salida, el login externo falla con `provider_unavailable`.

Para no alterar la topología de la Fase 3 hice el cambio **opt-in y aislado**: `docker-compose.oauth.yml` añade **solo a `auth-service`** una red `egress` (sin puertos publicados):

```bash
docker compose -f docker-compose.yml -f docker-compose.oauth.yml up --build
```
Sin ese archivo el stack se comporta exactamente como en Fase 3 (los botones de OAuth no aparecen si no hay credenciales; con credenciales pero sin salida, falla de forma controlada).
Alternativas que no implementé: un proxy de salida con lista de dominios permitidos (más estricto) o NetworkPolicy de egress en K8s (para el equipo de Kubernetes: el Auth Service necesita salida HTTPS a `accounts.google.com`, `oauth2.googleapis.com`, `www.googleapis.com`, `github.com`, `api.github.com`).
**Dime si prefieres otra opción antes de usarlo fuera de local.**

---

## 3. Archivos creados y modificados

**Creados**
- `services/auth/src/oauth/` — `core.ts` (flujo y reglas), `google.ts`, `github.ts`, `jose-verifier.ts`, `stores.ts`, `user-port.ts`, `oauth.service.ts`, `oauth.controller.ts`, `oauth.entities.ts`, `oauth.config.ts`, `crypto.ts`, `types.ts`
- `services/auth/src/common/session.ts` (contrato de sesión compartido login local/OAuth)
- `services/auth/test/oauth.test.ts`
- `scripts/migrations/auth-000-baseline.sql`, `scripts/migrations/auth-001-external-identities.sql`
- `docker-compose.oauth.yml`
- `frontend/climguard-web/src/app/features/auth/oauth-callback-page.ts`
- `FASE4_CAMBIOS.md`

**Modificados**
- `services/auth/`: `package.json` (+`jose ^5.9.6`; el script `test` ahora corre todos los `*.test.js`), `src/app.module.ts`, `src/auth.service.ts` (extrae `issueSession`; el login local devuelve lo mismo), `src/config.ts`, `src/entities/user.entity.ts` (`ExternalIdentity` completa)
- `services/gateway/Program.cs`, `services/gateway/appsettings.json` (4 rutas anónimas + política `oauth`)
- `frontend/climguard-web/src/app/`: `app.routes.ts`, `core/services/auth.service.ts`, `core/interceptors/auth.interceptor.ts`, `core/models/sesion.model.ts`, `features/auth/login-page.{ts,html,scss}`
- `docker-compose.yml` (solo el bloque de `auth-service`: variables OAuth y `DB_SYNCHRONIZE`), `.env.example`, `scripts/test-all.sh`, `MIGRACIONES.md`

No se modificó: Sensor, Community, Alert, Audit, Report, nginx, `gen-k8s.py`, firmware.

---

## 4. Migraciones

| Script | Qué hace |
|---|---|
| `auth-001-external-identities.sql` | Completa `external_identities` (`email`, `email_verified`, `display_name`, `avatar_url`, `created_at`, `last_login_at`), índice único `(provider, subject)`, índice por `user_id`; crea `oauth_flows` y `oauth_login_codes`. Aditiva, idempotente, en transacción. |
| `auth-000-baseline.sql` | Crea `roles` y `users` solo si no existen (base **nueva** con `DB_SYNCHRONIZE=false`). |

### Producción: `DB_SYNCHRONIZE=false` y aplicación controlada
1. Respaldo: `docker compose exec -T postgres pg_dump -U postgres climguard_auth > auth-backup-$(date +%F).sql`
2. Con `DB_SYNCHRONIZE=true` aún (o en una ventana de mantenimiento), **o** directamente:
   `docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U postgres -d climguard_auth < scripts/migrations/auth-001-external-identities.sql`
   (base nueva sin tablas: ejecutar antes `auth-000-baseline.sql`). Ajusta usuario/contenedor a tu despliegue (`DESPLIEGUE-SEGURO.md`).
3. Verifica: `\d external_identities`, `\dt oauth_*`.
4. Pon `DB_SYNCHRONIZE=false` en el entorno del Auth Service y reinícialo.
- Con `DB_SYNCHRONIZE=true` (local) TypeORM crea/ajusta las mismas tablas por su cuenta y puede renombrar o descartar índices creados por el script; usa **uno u otro** en cada entorno.
- Ninguna migración se ejecutó contra una base real.

---

## 5. Variables de entorno nuevas (Auth Service)

| Variable | Obligatoria | Descripción |
|---|---|---|
| `OAUTH_PUBLIC_BASE_URL` | Sí, si hay algún proveedor | URL pública (sin “/” final, sin ruta). `https` salvo `localhost`. Ej. `https://climguard.acifuina.online`, local `https://localhost:8443`. |
| `OAUTH_FRONTEND_URL` | No | Origen de Angular si difiere (por defecto igual a la anterior). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Para Google | Se definen **juntas**; vacías = proveedor deshabilitado. |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Para GitHub | Ídem. |
| `OAUTH_AUTO_PROVISION` | No (`false`) | `true` = registra usuarios nuevos como **Consulta**. |
| `OAUTH_ALLOWED_EMAIL_DOMAINS` | No | Lista separada por comas; restringe el auto-registro. |
| `OAUTH_FLOW_TTL_SECONDS` / `OAUTH_CODE_TTL_SECONDS` | No (600 / 60) | Vida del flujo y del código de canje. |
| `DB_SYNCHRONIZE` | No (`true`) | `false` en producción. |
| Gateway: `RateLimit__OAuthPerMinute` | No (30) | Limitador de las rutas anónimas OAuth. |

Para Kubernetes (otro equipo): los `*_CLIENT_SECRET` van en un Secret; el resto, en ConfigMap/env. No toqué `gen-k8s.py`.

---

## 6. Guía: Google Cloud (OIDC)
1. <https://console.cloud.google.com> → crea o elige un proyecto.
2. **APIs y servicios → Pantalla de consentimiento de OAuth**: tipo *Externo* (o *Interno* si usas Google Workspace), nombre de la app, correos de soporte y de contacto. Ámbitos: `openid`, `email`, `profile` (los básicos; no requieren verificación). En modo *Prueba* añade tus cuentas como *usuarios de prueba*.
3. **Credenciales → Crear credenciales → ID de cliente de OAuth → Aplicación web**.
4. **URI de redireccionamiento autorizados** (exactos, sin “/” final):
   - Local: `https://localhost:8443/api/auth/oauth/google/callback`
   - Producción: `https://climguard.acifuina.online/api/auth/oauth/google/callback`
5. Copia el *ID de cliente* y el *secreto* a tu `.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`). No los pegues en el repositorio ni en el chat.
6. Si Google rechaza `https://localhost:8443`, usa el puerto HTTP de borde si tu nginx lo sirve sin redirigir, o un dominio de pruebas. (No pude verificar cuál acepta tu consola.)

## 7. Guía: GitHub OAuth App
1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. *Homepage URL*: `OAUTH_PUBLIC_BASE_URL`. *Authorization callback URL* (una sola por app, así que crea una app para local y otra para producción):
   - Local: `https://localhost:8443/api/auth/oauth/github/callback`
   - Producción: `https://climguard.acifuina.online/api/auth/oauth/github/callback`
3. **Generate a new client secret** y copia ID y secreto a `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`.
4. El servicio pide los ámbitos `read:user user:email`. Una persona sin correo primario verificado no se auto-registra (`email_not_verified`).
5. El servicio envía PKCE (`code_challenge`); si tu OAuth App lo ignorara, la protección sigue descansando en `state` + `client_secret`. No pude verificar contra GitHub si tu app aplica PKCE.

---

## 8. Cómo probar en tu Docker Compose local
1. Copia el proyecto sobre tu repo (sección 10) y, si aún no tienes `.env`: `./scripts/gen-env.sh && ./scripts/gen-certs.sh`.
2. En `.env` (nunca al repo):
   ```
   OAUTH_PUBLIC_BASE_URL=https://localhost:8443
   OAUTH_AUTO_PROVISION=true
   GOOGLE_CLIENT_ID=…      GOOGLE_CLIENT_SECRET=…
   GITHUB_CLIENT_ID=…      GITHUB_CLIENT_SECRET=…
   ```
3. `docker compose -f docker-compose.yml -f docker-compose.oauth.yml up --build`
4. **Regresión primero**: entra con usuario/contraseña local; abre panel, sensores y reportes.
5. En `https://localhost:8443/login` deben aparecer *Google* y/o *GitHub*. Entra con una cuenta: debe crear un usuario `google_xxxxxxxxxxxx` / `github_xxxxxxxxxxxx` con rol **Consulta** (verifica en la pantalla Usuarios) y llevarte al panel. Un administrador puede subirle el rol desde esa pantalla (acción explícita).
6. Con `OAUTH_AUTO_PROVISION=false` el mismo login debe volver a `/login` con “Tu cuenta externa no está registrada”.
7. Comprueba que la URL final nunca contiene el token, que el código de `/auth/callback#code=…` desaparece de la barra, y que reutilizar el código (`POST /api/auth/oauth/exchange`) da 401.
8. ESP8266: el login local del dispositivo debe seguir respondiendo `200` con `rol: "Operador"`.
9. Pruebas unitarias sin Docker: `bash scripts/test-all.sh` (Auth + OAuth, Report, Audit, Alert). El paso final de YAML falla si no existe `k8s/climguard.yaml`, ya ocurría en el ZIP original (la carpeta `k8s/` se genera con `scripts/gen-k8s.py`).

---

## 9. Pruebas

### Ejecutadas (resultado real)
| Prueba | Resultado |
|---|---|
| `scripts/test-all.sh`, Auth (`tsc` + `node:test`): 6 pruebas de Fase 3 + **35 nuevas** | **41/41 OK** |
| Report (unittest) / Audit (unittest) / Alert (javac, evaluador de reglas) | 68 OK / 4 OK / 48 comprobaciones OK (sin cambios; regresión) |
| Migraciones SQL en **PostgreSQL temporal** (`psql`): base nueva (baseline + 001, dos veces cada una), esquema Fase 3 simulado con una fila existente (se conserva, columnas añadidas, 2ª ejecución sin cambios), unicidad `(provider, subject)` | OK |
| Consumo atómico de código con el SQL exacto de `stores.ts`, 8 sesiones concurrentes: gana 1; reuso 0; expirado 0; navegador distinto 0 | OK |
| Chequeo de tipos de todo `services/auth/src` con **stubs** de Nest/TypeORM/jose | OK (valida mis tipos, no el framework real) |
| `docker compose config` con ambos archivos (fusión de redes y variables) | OK |
| JSON de `appsettings.json` válido | OK |

Las 35 pruebas cubren: vector RFC 7636 de PKCE; `state`/`nonce` aleatorios y solo hash en BD; rechazo de `state` ausente/malformado/de otro navegador/reutilizado/expirado; que un tercero con el `state` robado no “quema” el flujo; código de un solo uso, expiración, canje concurrente y atado al navegador; Google (nonce incorrecto o ausente, token inválido, sin `sub`, endpoint caído, `email_verified`); GitHub (solo correo primario verificado, error 200 con `{error}`); sin auto-registro por defecto; rol Consulta; no vinculación por correo (un `admin@…` no entra como `admin`); dominios permitidos; carrera en el alta; cuenta desactivada; vinculación e `identity_in_use`; motivos de error fijos sin filtrar detalle; **contrato de login** (campos exactos y `rol: "Operador"` para el ESP8266; token válido para los demás servicios; una cuenta OAuth Consulta no puede escribir lecturas).

### Pendientes por limitaciones del entorno (no afirmo que funcionen)
- **No pude instalar paquetes de npm** (registro bloqueado): no se compiló ni ejecutó el Auth Service con NestJS/TypeORM reales ni con `jose` real. `jose-verifier.ts`, `user-port.ts`, el controlador (cookies, redirecciones) y `oauth.service.ts` solo tienen chequeo de tipos con stubs. La verificación del ID Token real contra el JWKS de Google solo se probó con un verificador simulado.
- **Gateway**: no hay `dotnet`; `Program.cs` y las rutas YARP no se compilaron ni probaron.
- **Angular**: sin `node_modules`; no se compiló ni se probó en navegador.
- `docker compose up`, el flujo real con Google y con GitHub, y las cookies detrás de nginx/TLS: sin Docker daemon ni Internet.
- La primera construcción de imagen debe hacer `npm install` (el servicio no tiene lockfile): conviene que generes y subas `package-lock.json` tras instalar `jose`.

### Funcionalidades pendientes
- **Pantalla para vincular** una cuenta externa a un usuario existente: el backend (`POST /api/auth/oauth/{proveedor}/link`) y `AuthService.vincularOAuth()` existen, pero no agregué botón (no conozco el layout de perfil). Hasta entonces, las cuentas locales existentes (p. ej. `admin`) siguen entrando con contraseña; el acceso externo de una persona nueva se crea como Consulta y un admin la asciende.
- Sin refresh token (la sesión OAuth dura `JWT_EXPIRATION_MINUTES`, igual que la local).
- No hay desvinculación de identidades ni listado de identidades por usuario.
- Kubernetes/K3s (Secrets, ConfigMap, NetworkPolicy de salida): a cargo de otros integrantes.
- Los `access.log` de nginx registrarán la query del callback (`code`, `state`): son de un solo uso y el `code` queda atado a PKCE y al `client_secret`, pero conviene no conservar esos logs mucho tiempo.
- `external_identities.email` guarda el correo informativo del proveedor (dato personal): no se usa para autorizar.

---

## 10. ESP8266 (no modificado)

Con el sketch (`ClimGuard.ino`) y `ClimGuardCA.h` que me enviaste confirmo la autenticación real del dispositivo:
`POST /api/auth/login` con `{"username","password"}` (usuario `esp8266_climguard`) → exige HTTP 200, `rol == "Operador"` y `token` → `POST /api/readings` con `Authorization: Bearer`, renovando el JWT cada 5 min o ante un 401. TLS con la raíz ISRG Root X1 fijada.

**Compatibilidad con esta entrega: sin cambios necesarios.** El login local conserva ruta, JSON de entrada y de salida, el nombre de rol y los claims (el campo extra `nombreCompleto` se agrega solo en el canje OAuth, no en el login local); `POST /api/readings` y el Sensor Service no se tocaron; el dispositivo no usa Google/GitHub. Las cuentas OAuth se crean siempre como Consulta, así que no pueden escribir lecturas, y sus usuarios se llaman `google_…`/`github_…`, que no pueden chocar con `esp8266_climguard`.

Observaciones (fuera de alcance, sin modificar):
1. El sketch trae **la contraseña del Wi-Fi y la del usuario del dispositivo en texto plano**. Como pasaron por este chat, conviene **rotar ambas** y moverlas a un archivo no versionado (p. ej. `secrets.h` en `.gitignore`). No incluí el sketch en el ZIP.
2. Mantén `esp8266_climguard` con rol **Operador** y sin cuenta externa vinculada. Si el rol cambia a otro nombre, el sketch dejará de aceptar el login.
3. Con el limitador de login del Gateway (10/min por IP) no hay problema: el dispositivo inicia sesión una vez cada 5 min. Muchos dispositivos tras el mismo NAT comparten ese límite.
4. Futuro (no hecho, según tu decisión 5): una credencial propia de dispositivo evitaría guardar usuario y contraseña en el firmware.

---

## 11. Integrar en el repositorio Git
```bash
git switch -c fase4-oauth
# Copia el contenido del ZIP encima de tu árbol de trabajo (no incluye .git, .env, node_modules ni certificados):
#   rsync -a --exclude='.git' ClimGuard-fase4-oauth/ ./     (o copia manual)
git status                       # revisa que solo aparezcan los archivos de la sección 3
git diff --stat
cd services/auth && npm install && npm test && git add package-lock.json && cd ../..   # genera el lockfile con jose
bash scripts/test-all.sh
git add -A && git commit -m "Fase 4: login con Google (OIDC) y GitHub (OAuth2) en Auth Service"
```
Antes del merge: probar la sección 8 en local, aplicar `auth-001` a staging con respaldo y confirmar la sección 2 (salida a Internet del Auth Service).
