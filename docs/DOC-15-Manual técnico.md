# ClimGuard
## Manual Técnico e Instalación

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Manual Técnico e Instalación |
| Código | DOC-15 |
| Versión | 2.0 |
| Estado | Finalizado |

---

# Tabla de Contenido

1. Introducción
2. Arquitectura del Sistema
3. Requisitos del Entorno
4. Estructura del Proyecto
5. Configuración del Proyecto
6. Ejecución con Docker
7. Ejecución Manual
8. Base de Datos
9. Tecnologías Utilizadas
10. Consideraciones para Desarrollo
11. Posibles Mejoras

---

# 1. Introducción

El presente documento describe los aspectos técnicos necesarios para instalar, ejecutar y mantener el sistema ClimGuard.

Está dirigido a desarrolladores, administradores de sistemas y personal encargado del despliegue de la aplicación.

---

# 2. Arquitectura del Sistema

ClimGuard se implementa utilizando una arquitectura cliente-servidor compuesta por:

- Frontend desarrollado en Angular.
- Backend desarrollado en .NET Web API.
- Base de datos SQL Server.
- Comunicación en tiempo real mediante SignalR.
- Background Service para la simulación automática de lecturas y generación de alertas.
- Contenedores Docker para facilitar el despliegue.

La comunicación entre el cliente y el servidor se realiza mediante servicios REST, mientras que la actualización de información en tiempo real se implementa mediante SignalR. Adicionalmente, un Background Service ejecuta de forma periódica la simulación de sensores, registra lecturas y genera alertas automáticamente.

---

# 3. Requisitos del Entorno

Para ejecutar el sistema se requiere:

## Software

- Docker Desktop
- Docker Compose
- Git
- SQL Server 2022 (contenedor)
- .NET 10 SDK (solo para desarrollo)
- Node.js 20 LTS o superior (solo para desarrollo)
- Angular CLI (solo para desarrollo)
- Nginx (para despliegues en Linux con HTTPS).

## Hardware recomendado

- Procesador de 4 núcleos
- 8 GB de RAM
- 15 GB de espacio libre
- Conexión a Internet (para descarga de imágenes Docker)

---

# 4. Estructura del Proyecto

```
ClimGuard
│
├── frontend/
│   └── climguard-web
│
├── ClimGuard Backend/
│
├── docker-compose.yml
│
├── Script para DB/
│
└── Documentación/
```

### Frontend

Contiene la aplicación Angular.

### Backend

Contiene la API REST desarrollada en .NET.

### Base de Datos

Incluye los scripts de creación y carga inicial.

---

# 5. Configuración del Proyecto

Antes de ejecutar el sistema deben configurarse los archivos correspondientes.

## Backend

Configurar la cadena de conexión en:

```
appsettings.json
```
Verificar que la base de datos haya sido inicializada utilizando el script QueryMain_P2.sql y que existan los registros iniciales de los catálogos requeridos (Comunidades, Tipos de Sensor, Estados, Niveles de Alerta, etc.).
## Frontend

Configurar la URL de la API dentro del archivo:

```
environment.ts
```

---

# 6. Ejecución con Docker

Desde la raíz del proyecto ejecutar:

```bash
docker compose up --build
```

Para iniciar los servicios en segundo plano:

```bash
docker compose up -d
```
Una vez iniciados los contenedores puede verificarse su estado mediante:

```bash
docker ps
```

Y consultar los registros de la API utilizando:

```bash
docker logs climguard-api
```
Para detener los servicios:

```bash
docker compose down
```

Para detener y eliminar los volúmenes:

```bash
docker compose down -v
```

---

# 7. Ejecución Manual

## Backend

Ingresar al proyecto:

```bash
cd "ClimGuard Backend"
```

Ejecutar:

```bash
dotnet run --project API/API.csproj
```

---

## Frontend

Ingresar al proyecto:

```bash
cd frontend/climguard-web
```

Instalar dependencias:

```bash
npm install
```

Ejecutar:

```bash
ng serve
```

---

# 8. Base de Datos

La base de datos se crea automáticamente mediante los scripts incluidos en el proyecto.

Durante la inicialización se crean:

- Tablas principales.
- Tablas catálogo.
- Reglas de alerta iniciales.
- Usuarios de prueba.

El script principal es:

```
QueryMain_P2.sql
```

---

# 9. Tecnologías Utilizadas

| Tecnología | Versión |
|------------|----------|
| Angular | 20 |
| .NET | 10 |
| SQL Server | 2022 |
| SignalR | Incluido en .NET |
| Entity Framework Core | 10 |
| Nginx | Última escalable |
| Docker | Última estable |
| Git | Control de versiones |
| GitHub | Repositorio remoto |

---

# 10. Consideraciones para Desarrollo

El sistema fue diseñado utilizando una arquitectura por capas.

Las principales responsabilidades se distribuyen de la siguiente manera:

- Controllers: recepción de solicitudes HTTP.
- Services: lógica de negocio.
- Repositories: acceso a datos.
- Models: representación de las entidades.
- Components: interfaz de usuario.
- Background Services: simulación automática de lecturas, actualización del valor actual de los sensores y generación de alertas.
- Las alertas se generan automáticamente mediante la evaluación de las reglas configuradas para cada tipo de sensor, conservando snapshots de la información utilizada al momento de su creación.

La comunicación en tiempo real se implementa mediante SignalR.

---

# 11. Posibles Mejoras

Las siguientes funcionalidades podrán incorporarse en futuras versiones:

- Integración con sensores físicos (ESP32).
- Notificaciones mediante correo electrónico.
- Notificaciones por SMS.
- Reportes en PDF y Excel.
- Dashboard con gráficas dinámicas.
- Gestión completa de usuarios.
- Historial avanzado de lecturas.
- Integración con servicios meteorológicos externos.

---

# Observaciones

- El presente documento corresponde al segundo release del sistema ClimGuard.
- El sistema incorpora un Background Service que genera lecturas simuladas, las almacena en la base de datos y evalúa automáticamente las reglas de alerta configuradas.
- La arquitectura implementada permite incorporar dispositivos IoT sin modificaciones significativas en la estructura general del sistema.