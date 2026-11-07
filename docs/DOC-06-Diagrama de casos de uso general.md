# ClimGuard
## Diagrama General de Casos de Uso

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Diagrama General de Casos de Uso |
| Código | DOC-06 |
| Versión | 3.0 |
| Estado | Vigente (ClimGuard 4.1) |

### Historial de versiones
| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | Agosto 2026 | Diagrama de las Fases 1 y 2 (Administrador y Operador, UC1 a UC8). |
| 3.0 | Noviembre 2026 | Diagrama vigente de ClimGuard 4.1 con los roles, actores externos y casos de uso CU-009 a CU-013. |

> El primer diagrama es el original de las Fases 1 y 2; el vigente está al final.

---

# Objetivo

El presente documento presenta el diagrama general de casos de uso implementados en ClimGuard, mostrando la interacción entre los actores del sistema y las funcionalidades disponibles para cada uno de ellos.

# Diagrama original (Fases 1 y 2)
```mermaid
---
title: ClimGuard - Diagrama General de Casos de Uso
---

flowchart LR

Administrador
Operador

subgraph ClimGuard

UC1((Acceder al sistema))
UC2((Gestionar comunidades))
UC3((Gestionar sensores))
UC4((Configurar umbrales))
UC5((Monitorear variables))
UC6((Recibir alertas))
UC7((Visualizar alertas activas))
UC8((Consultar bitácora))

end

Administrador --- UC1
Administrador --- UC2
Administrador --- UC3
Administrador --- UC4
Administrador --- UC8

Operador --- UC1
Operador --- UC5
Operador --- UC6
Operador --- UC7
```

# Diagrama vigente (ClimGuard 4.1)

```mermaid
flowchart LR
Administrador
Operador
Consulta
Dispositivo[Dispositivo ESP8266]
Proveedor[Google / GitHub]

subgraph ClimGuard
UC1((Acceder al sistema))
UC9((Iniciar sesión con proveedor externo))
UC2((Gestionar comunidades))
UC3((Gestionar sensores))
UC13((Gestionar reglas de alerta))
UC5((Monitorear variables))
UC7((Visualizar alertas activas))
UC11((Atender alerta))
UC10((Registrar lectura))
UC12((Generar reporte PDF))
UC8((Consultar bitácora))
UC14((Gestionar usuarios))
UC15((Gestionar tipos de fenómeno))
end

Administrador --- UC1 & UC9 & UC2 & UC3 & UC13 & UC5 & UC7 & UC11 & UC12 & UC8 & UC14 & UC15
Operador --- UC1 & UC9 & UC5 & UC7 & UC11 & UC15
Consulta --- UC1 & UC9 & UC5
Dispositivo --- UC10
UC9 --- Proveedor
```

| Actor | Descripción |
|---|---|
| Administrador | Gestiona todo el sistema |
| Operador | Monitorea, atiende alertas y gestiona tipos de fenómeno |
| Consulta | Solo lectura del panel, mapa, sensores, comunidades y reglas |
| Dispositivo ESP8266 | Envía lecturas con una cuenta de servicio de rol Operador |
| Google / GitHub | Proveedores de identidad externos |
