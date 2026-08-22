# ClimGuard
## Sistema Web de Monitoreo y Alerta Temprana para Riesgos Climáticos

Proyecto desarrollado para el curso de **Desarrollo Web**.

---

## Descripción

ClimGuard es una plataforma web para el monitoreo de variables climáticas en tiempo real, diseñada para detectar automáticamente condiciones de riesgo y generar alertas tempranas para comunidades vulnerables.

La solución fue desarrollada utilizando una arquitectura cliente-servidor basada en **Angular**, **.NET**, **SQL Server**, **SignalR** y **Docker**, permitiendo una futura integración con dispositivos IoT como ESP32 y sensores físicos.

---

# Tecnologías

- Angular 20
- .NET 10 Web API
- SQL Server 2022
- SignalR
- Docker
- Git
- GitHub

---

# Documentación

| Documento | Descripción |
|------------|-------------|
| [DOC-00 – Estándar de Documentación](docs/DOC-00-Estandar%20de%20Documentacion.md) | Convenciones utilizadas en toda la documentación del proyecto. |
| [DOC-01 – Introducción](docs/DOC-01-Introduccion.md) | Introducción, objetivos, alcance y tecnologías utilizadas. |
| [DOC-02 – Requerimientos](docs/DOC-02-Requerimientos.md) | Requerimientos funcionales, no funcionales, restricciones y criterios de aceptación. |
| [DOC-03 – Reglas del Negocio](docs/DOC-03-Reglas%20del%20Negocio.md) | Reglas de negocio que gobiernan el funcionamiento del sistema. |
| [DOC-04 – Historias de Usuario](docs/DOC-04-Historias%20de%20usuario.md) | Historias de usuario implementadas. |
| [DOC-05 – Casos de Uso](docs/DOC-05-Casos%20de%20uso.md) | Especificación detallada de los casos de uso. |
| [DOC-06 – Diagrama General de Casos de Uso](docs/DOC-06-Diagrama%20de%20casos%20de%20uso%20general.md) | Diagrama general de actores y funcionalidades. |
| [DOC-07 – Diagramas de Actividades](docs/DOC-07-Diagramas%20de%20Actividades.md) | Diagramas de actividad de los procesos principales. |
| [DOC-08 – Diagramas de Secuencia](docs/DOC-08-Diagramas%20de%20secuencia.md) | Diagramas de interacción entre componentes. |
| [DOC-09 – Diagrama de Clases](docs/DOC-09-Diagrama%20de%20clases.md) | Modelo de clases del dominio del sistema. |
| [DOC-10 – Modelo de Base de Datos](docs/DOC-10-Modelo%20de%20BD.md) | Modelo relacional y estructura de la base de datos. |
| [DOC-11 – Diagrama Entidad-Relación](docs/DOC-11%20Diagrama%20Entidad-Relación.md) | Diagrama entidad-relación de la base de datos. |
| [DOC-12 – API REST](docs/DOC-12-API.md) | Documentación de los endpoints implementados. |
| [DOC-13 – Arquitectura de Software](docs/DOC-13-Arquitectura%20de%20Software.md) | Arquitectura lógica, física y de componentes del sistema. |
| [DOC-14 – Manual de Usuario](docs/DOC-14-Manual%20de%20usuario.md) | Guía de utilización del sistema. |
| [DOC-15 – Manual Técnico](docs/DOC-15-Manual%20técnico.md) | Instalación, configuración y mantenimiento del sistema. |

---

# Estructura del Proyecto

```text
ClimGuard
│
├── frontend/
│   └── climguard-web/
│
├── ClimGuard Backend/
│
├── docker/
│
├── docs/
│   ├── DOC-00-Estandar de Documentacion.md
│   ├── DOC-01-Introduccion.md
│   ├── DOC-02-Requerimientos.md
│   ├── DOC-03-Reglas del Negocio.md
│   ├── DOC-04-Historias de usuario.md
│   ├── DOC-05-Casos de uso.md
│   ├── DOC-06-Diagrama de casos de uso general.md
│   ├── DOC-07-Diagramas de Actividades.md
│   ├── DOC-08-Diagramas de secuencia.md
│   ├── DOC-09-Diagrama de clases.md
│   ├── DOC-10-Modelo de BD.md
│   ├── DOC-11 Diagrama Entidad-Relación.md
│   ├── DOC-12-API.md
│   ├── DOC-13-Arquitectura de Software.md
│   ├── DOC-14-Manual de usuario.md
│   └── DOC-15-Manual técnico.md
│
├── docker-compose.yml
│
└── README.md
```

---

# Ejecución rápida

Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
```

Ingresar al proyecto:

```bash
cd ClimGuard
```

Levantar los contenedores:

```bash
docker compose up --build
```

Para detener los servicios:

```bash
docker compose down
```

---

# Arquitectura

El sistema está compuesto por:

- Frontend Angular 20
- Backend .NET 10 Web API
- SQL Server 2022
- SignalR para comunicación en tiempo real
- Docker para el despliegue

La comunicación entre el frontend y el backend se realiza mediante una API REST.

---

# Equipo de desarrollo

Dalila Nineth Zacarías de León
Mahuerk Yoc Vázquez
Maryori Elizabeth Acifuina Juárez

---