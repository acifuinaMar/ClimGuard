# ClimGuard

## Sistema Web de Monitoreo y Alerta Temprana para Riesgos Climáticos

> Proyecto desarrollado para el curso de **Desarrollo Web** utilizando una arquitectura cliente-servidor basada en Angular, ASP.NET Core, SQL Server y Docker.

---

## Descripción

ClimGuard es una plataforma web diseñada para el monitoreo de variables climáticas y la generación automática de alertas tempranas para comunidades vulnerables.

El sistema permite administrar comunidades, sensores, reglas de alerta y catálogos, mientras un **Background Service** simula el comportamiento de los sensores, registra lecturas históricas y genera alertas automáticamente cuando se cumplen las condiciones configuradas.

La información se actualiza en tiempo real mediante **SignalR**, ofreciendo una experiencia dinámica para el usuario.

---

# Características principales

- Administración de comunidades.
- Gestión de sensores climáticos.
- Simulación automática de lecturas.
- Generación automática de alertas.
- Configuración de reglas de alerta.
- Historial de lecturas.
- Bitácora de acciones.
- Actualización en tiempo real mediante SignalR.
- Despliegue utilizando Docker.
- Arquitectura preparada para integrar sensores físicos (IoT).

---

# Tecnologías utilizadas

| Tecnología | Versión |
|------------|----------|
| Angular | 20 |
| ASP.NET Core Web API | 10 |
| SQL Server | 2022 |
| Entity Framework Core | 10 |
| SignalR | Incluido en .NET |
| Docker & Docker Compose | Última estable |
| Git | Control de versiones |
| GitHub | Repositorio remoto |

---

# Arquitectura

El sistema se encuentra organizado bajo una arquitectura cliente-servidor.

```text
                 Usuario
                    │
                    ▼
            Angular Frontend
                    │
          REST API + SignalR
                    │
          ASP.NET Core Web API
                    │
      Background Service (Simulación)
                    │
              SQL Server 2022
```

El **Background Service** ejecuta periódicamente la simulación de sensores, registra las lecturas generadas, evalúa las reglas configuradas y crea automáticamente las alertas correspondientes.

---

# Estructura del Proyecto

```text
ClimGuard
│
├── frontend/
│   └── climguard-web/
│
├── ClimGuard Backend/
│   ├── API/
│   ├── Application/
│   ├── Domain/
│   ├── Infrastructure/
│   └── Services/
│
├── Script para DB/
│
├── docs/
│
├── docker-compose.yml
│
└── README.md
```

---

# Ejecución rápida

## 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
```

## 2. Ingresar al proyecto

```bash
cd ClimGuard
```

## 3. Levantar el entorno

```bash
docker compose up --build
```

## 4. Detener los servicios

```bash
docker compose down
```

---

# Documentación

La documentación completa del proyecto se encuentra disponible en la carpeta **docs/** e incluye:

- Introducción
- Requerimientos
- Reglas de negocio
- Historias de usuario
- Casos de uso
- Diagramas UML
- Modelo de Base de Datos
- API REST
- Arquitectura de Software
- Manual de Usuario
- Manual Técnico

---

# Funcionalidades implementadas

- Gestión de usuarios y roles.
- Administración de comunidades.
- Administración de sensores.
- Gestión de tipos de sensores.
- Gestión de estados.
- Gestión de niveles de alerta.
- Gestión de tipos de fenómeno.
- Configuración de reglas de alerta.
- Simulación automática de lecturas.
- Generación automática de alertas.
- Historial de lecturas.
- Bitácora del sistema.
- Dashboard con actualización en tiempo real.

---

# Trabajo futuro

El sistema fue diseñado para facilitar futuras ampliaciones, entre ellas:

- Integración con sensores físicos (ESP32 u otros dispositivos IoT).
- Envío de notificaciones por correo electrónico.
- Integración con servicios meteorológicos externos.
- Reportes en PDF y Excel.
- Predicción de riesgos mediante modelos de inteligencia artificial.

---

# Equipo de desarrollo

- **Dalila Nineth Zacarías de León**
- **Mahuerk Yoc Vázquez**
- **Maryori Elizabeth Acifuina Juárez**

---

# Licencia

Proyecto desarrollado con fines académicos para el curso de **Desarrollo Web**.