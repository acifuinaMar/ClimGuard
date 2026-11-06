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

# Declaración de uso de inteligencia artificial

En el desarrollo de este proyecto el equipo utilizó herramientas de IA generativa como **asistentes**. Las decisiones de diseño, la revisión del código y la aprobación de cada cambio fueron responsabilidad del equipo.

| Herramienta | Uso |
|---|---|
| **ChatGPT** (OpenAI) | Apoyo de consulta durante el desarrollo. *(El equipo completa aquí en qué partes se usó.)* |
| **Claude Code** (Anthropic) | En la Fase 4, bajo instrucciones y aprobación del equipo en cada etapa: diagnóstico de la VPS, generación de los manifiestos Kubernetes (`scripts/gen-k8s.py`), scripts de secretos, restauración y recuperación (`scripts/k8s-*.sh`, `scripts/rollback-fase3.sh`), ejecución del despliegue en K3s y de la migración de datos, y redacción de `K3S_PROGRESS.md` y `k8s/README.md`. También en los commits que lo declaran con `Co-Authored-By: Claude` (por ejemplo `9179568`, `cb42ef6`, `dea5c12`). |

Qué **no** hizo la IA:
- Las pruebas funcionales en el navegador (login local, Google y GitHub, dashboard, sensores ESP8266 físicos y simulados) las realizó el equipo.
- La configuración de las aplicaciones OAuth en Google Cloud y GitHub, el registro de sus credenciales y la clasificación de los sensores como *Físico* o *Simulado* los hizo el equipo.
- Las credenciales no se escribieron en las conversaciones. Claude Code ejecutó en la VPS los scripts que crean los Secrets de Kubernetes, diseñados para no imprimir valores. Una excepción quedó documentada en `K3S_PROGRESS.md`: la contraseña `sa` de proyecto2 apareció en una salida y se eliminó junto con ese despliegue.
- El código y la documentación generados con ayuda de IA fueron revisados por el equipo antes de incorporarlos.

---

# Equipo de desarrollo

- **Dalila Nineth Zacarías de León**
- **Mahuerk Yoc Vázquez**
- **Maryori Elizabeth Acifuina Juárez**

---

# Licencia

Proyecto desarrollado con fines académicos para el curso de **Desarrollo Web**.