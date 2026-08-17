# ClimGuard
## Diagrama General de Casos de Uso

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Diagrama General de Casos de Uso |
| Código | DOC-06 |
| Versión | 1.0 |
| Estado | En desarrollo |

---

# Objetivo

El presente documento representa gráficamente la interacción entre los actores del sistema ClimGuard y los casos de uso definidos durante el análisis funcional.

El diagrama permite visualizar las funcionalidades disponibles para cada actor, así como las relaciones existentes entre los diferentes casos de uso.

# Diagrama
```mermaid
---
title: ClimGuard - Diagrama General de Casos de Uso
---
flowchart LR

Administrador
Operador
UsuarioDeMonitoreo

subgraph ClimGuard
UC1((Acceder al sistema))
UC12((Recuperar contraseña))
UC13((Restablecer contraseña))
UC2((Gestionar comunidades))
UC3((Gestionar sensores))
UC4((Gestionar usuarios))
UC5((Configurar umbrales))
UC11((Reiniciar el sistema de monitoreo))
UC6((Monitorear variables))
UC7((Recibir alertas))
UC8((Consultar alertas))
UC9((Consultar historial))
UC10((Consultar bitácora))

Administrador --- UC1
Administrador --- UC2
Administrador --- UC3
Administrador --- UC4
Administrador --- UC6
Administrador --- UC10
Administrador --- UC11

Operador --- UC1
Operador --- UC5
Operador --- UC6
Operador --- UC7
Operador --- UC8
Operador --- UC9

Usuario --- UC1
Usuario --- UC6
Usuario --- UC7

UC12 -.->|<<extend>>| UC1
UC13 -.->|<<extend>>| UC12
end
```