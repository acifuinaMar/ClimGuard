# ClimGuard
## Diagramas de Actividades

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Diagramas de Actividades |
| Código | DOC-07 |
| Versión | 1.0 |
| Estado | Finalizado |

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