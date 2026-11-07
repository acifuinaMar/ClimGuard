# ClimGuard
## Diagramas de Actividades

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Diagramas de Actividades |
| Código | DOC-07 |
| Versión | 3.0 |
| Estado | Vigente (ClimGuard 4.1) |

### Historial de versiones
| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 | Agosto 2026 | DA-001 a DA-008 (Fases 1 y 2). |
| 3.0 | Noviembre 2026 | DA-009 a DA-011 (inicio de sesión externo, procesamiento de lecturas físicas y simuladas, generación de reportes); nota de vigencia en DA-004. |

> DA-001 a DA-008 se conservan como se diseñaron.

---

# Objetivo

El presente documento presenta los diagramas de actividades correspondientes a los casos de uso implementados en ClimGuard, mostrando el flujo de acciones, decisiones y resultados de los principales procesos del sistema.

# DA-001 – Acceder al sistema
```mermaid
flowchart TD

A([Inicio])

B[Acceder a la pantalla de inicio de sesión]

C[Ingresar usuario y contraseña]

D[Validar credenciales]

E{¿Credenciales válidas?}

F[Mostrar mensaje de error]

G{¿Usuario activo?}

H[Registrar inicio de sesión]

I[Mostrar Dashboard]

J([Fin])

A --> B
B --> C
C --> D
D --> E

E -- No --> F
F --> J

E -- Sí --> G

G -- No --> F

G -- Sí --> H
H --> I
I --> J
```

# DA-002 - Gestionar comunidades 
```mermaid
flowchart TD

A([Inicio])

B[Ingresar al módulo de Comunidades]

C[Mostrar listado]

D[Seleccionar acción]

E{Acción}

F[Registrar comunidad]

G[Modificar comunidad]

H[Eliminar comunidad]

I[Asociar sensores]

J[Validar información]

K[Guardar cambios]

L[Actualizar listado]

M([Fin])

A --> B
B --> C
C --> D

D --> E

E -->|Registrar| F
E -->|Modificar| G
E -->|Eliminar| H
E -->|Asociar sensores| I

F --> J
G --> J
H --> J
I --> J

J --> K
K --> L
L --> M
```

# DA-003 - Gestionar sensores
```mermaid
flowchart TD

A([Inicio])

B[Ingresar al módulo de Sensores]

C[Mostrar sensores]

D[Seleccionar acción]

E{Acción}

F[Registrar sensor]

G[Modificar sensor]

H[Activar sensor]

I[Desactivar sensor]

J[Validar información]

K[Guardar cambios]

L[Actualizar listado]

M([Fin])

A --> B
B --> C
C --> D

D --> E

E -->|Registrar| F
E -->|Modificar| G
E -->|Activar| H
E -->|Desactivar| I

F --> J
G --> J
H --> J
I --> J

J --> K
K --> L
L --> M
```

# DA-004 - Configurar umbrales

> **Estado en ClimGuard 4.1:** los umbrales se gestionan como reglas de alerta (CU-013).
```mermaid
flowchart TD

A([Inicio])

B[Acceder al módulo de Umbrales]

C[Mostrar umbrales actuales]

D[Modificar valores]

E[Validar información]

F{¿Información válida?}

G[Mostrar errores]

H[Guardar configuración]

I[Confirmar actualización]

J([Fin])

A --> B
B --> C
C --> D
D --> E
E --> F

F -- No --> G
G --> D

F -- Sí --> H
H --> I
I --> J
```

# DA-005 - Monitorear variables climáticas
```mermaid
flowchart TD

A([Inicio])

B[Acceder al Dashboard]

C[Mostrar comunidades]

D[Seleccionar comunidad]

E[Obtener lecturas]

F{¿Existen sensores?}

G[Mostrar mensaje]

H[Actualizar información]

I[Mostrar variables climáticas]

J[Mostrar estado de sensores]

K{¿Nueva lectura recibida por SignalR?}

L([Fin])

A --> B
B --> C
C --> D
D --> E
E --> F

F -- No --> G
G --> L

F -- Sí --> H
H --> I
I --> J
J --> K

K -- Sí --> H
K -- No --> L
```

# DA-006 - Recibir alertas
```mermaid
flowchart TD

A([Inicio])

B[Nueva lectura recibida]

C[Comparar con umbrales]

D{¿Supera el umbral?}

E[Continuar monitoreo]

F[Clasificar alerta]

G[Registrar alerta]

I[Notificar usuario]

J([Fin])

A --> B
B --> C
C --> D

D -- No --> E
E --> J

D -- Sí --> F
F --> G
G --> I
I --> J
```

# DA-007 – Visualizar alertas activas

```mermaid
flowchart TD

A([Inicio])

B[Acceder al panel de Alertas]

C{¿Existen alertas activas?}

D[Mostrar mensaje: No existen alertas activas]

E[Obtener alertas activas]

F[Mostrar listado de alertas]

G([Fin])

A --> B

B --> C

C -- No --> D

D --> G

C -- Sí --> E

E --> F

F --> G
```

# DA-008 - Consultar bitácora
```mermaid
flowchart TD

A([Inicio])

B[Acceder al módulo de Bitácora]

C{¿Existen registros?}

D[Mostrar mensaje]

E[Mostrar listado de registros]

F[Seleccionar registro]

G[Mostrar detalle del registro]

H([Fin])

A --> B
B --> C

C -- No --> D
D --> H

C -- Sí --> E
E --> F
F --> G
G --> H
```

---

# DA-009 – Iniciar sesión con un proveedor externo
```mermaid
flowchart TD
A([Inicio]) --> B[Pulsar Google o GitHub]
B --> C[Redirigir al proveedor con state y PKCE]
C --> D{¿Autoriza el usuario?}
D -- No --> X[Volver al inicio de sesión con mensaje]
D -- Sí --> E[Canjear el código y validar la identidad]
E --> F{¿Identidad vinculada?}
F -- Sí --> H[Emitir código de un solo uso]
F -- No --> G{¿Auto-registro y correo verificado?}
G -- No --> X
G -- Sí --> G2[Crear usuario con rol Consulta] --> H
H --> I[El navegador canjea el código por la sesión]
I --> J([Mostrar el panel])
```

---

# DA-010 – Procesar una lectura (sensor físico o simulado)
```mermaid
flowchart TD
A([Nueva lectura]) --> B{Origen}
B -- Físico --> C[El dispositivo envía la lectura autenticado]
B -- Simulado --> D[El simulador genera la lectura cada 5 s si el sensor está activo]
C --> E[Guardar la lectura]
D --> E
E --> F[Publicar LecturaNueva en tiempo real]
F --> G[Evaluar reglas activas del tipo de sensor]
G --> H{¿Cae en un intervalo de peligro?}
H -- No --> Z([Fin])
H -- Sí --> I{¿En período de espera para ese sensor y regla?}
I -- Sí --> Z
I -- No --> J[Crear alerta con el nivel más alto que corresponda]
J --> K[Publicar AlertaNueva y activar la alarma si es emergencia]
K --> Z
```

---

# DA-011 – Generar un reporte PDF
```mermaid
flowchart TD
A([Inicio]) --> B[Elegir tipo y filtros]
B --> C{¿Cola de reportes llena?}
C -- Sí --> X[Informar y pedir reintentar más tarde]
C -- No --> D[Registrar el reporte como pendiente]
D --> E[Obtener los datos de los servicios]
E --> F{¿Supera el máximo de filas?}
F -- Sí --> Y[Marcar como fallido e informar límite y total]
F -- No --> G[Generar el PDF por partes y guardarlo]
G --> H[Marcar como completado]
H --> I([Disponible para descargar])
```
