# ClimGuard
## Diagrama General de Casos de Uso

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Diagrama General de Casos de Uso |
| Código | DOC-06 |
| Versión | 1.0 |
| Estado | Finalizado |

---

# Objetivo

El presente documento presenta el diagrama general de casos de uso implementados en ClimGuard, mostrando la interacción entre los actores del sistema y las funcionalidades disponibles para cada uno de ellos.

# Diagrama
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