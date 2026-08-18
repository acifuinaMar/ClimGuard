# ClimGuard
## Diagramas de Actividades

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Diagramas de Actividades |
| Código | DOC-07 |
| Versión | 1.0 |
| Estado | En desarrollo |

---

# Objetivo

El presente documento describe gráficamente el flujo de actividades correspondiente a cada caso de uso del sistema ClimGuard, mostrando la secuencia lógica de acciones, decisiones y resultados para cada proceso.

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

# DA-004 - Gestionar usuarios
```mermaid
flowchart TD

A([Inicio])

B[Ingresar al módulo de Usuarios]

C[Mostrar usuarios]

D[Seleccionar acción]

E{Acción}

F[Registrar usuario]

G[Modificar usuario]

H[Desactivar usuario]

I[Asignar rol]

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
E -->|Desactivar| H
E -->|Asignar rol| I

F --> J
G --> J
H --> J
I --> J

J --> K
K --> L
L --> M
```

# DA-005 - Configurar umbrales
```mermaid
flowchart TD

A([Inicio])

B[Acceder al módulo de Configuración]

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

# DA-006 - Monitorear variables climáticas
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

K{¿Nueva lectura recibida?}

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
# DA-007 - Recibir alertas
```mermaid
flowchart TD

A([Inicio])

B[Nueva lectura recibida]

C[Comparar con umbrales]

D{¿Supera el umbral?}

E[Continuar monitoreo]

F[Clasificar alerta]

G[Registrar alerta]

H[Registrar evento en el historial]

I[Notificar usuario]

J([Fin])

A --> B
B --> C
C --> D

D -- No --> E
E --> J

D -- Sí --> F
F --> G
G --> H
H --> I
I --> J
```

# DA-008 - Consultar Alertas
```mermaid
flowchart TD

A([Inicio])

B[Acceder al módulo de Alertas]

C{¿Existen alertas?}

D[Mostrar mensaje]

E[Mostrar listado]

F[Seleccionar alerta]

G[Mostrar detalle]

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

# DA-009 - Consultar historial
```mermaid
flowchart TD

A([Inicio])

B[Acceder al módulo de Historial]

C{¿Existen eventos registrados?}

D[Mostrar mensaje]

E[Mostrar historial]

F[Seleccionar evento]

G[Mostrar detalle]

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

# DA-010 - Consultar bitácora
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

# DA-011 - Reiniciar el sistema de monitoreo
```mermaid
flowchart TD

A([Inicio])

B[Seleccionar Reiniciar sistema de monitoreo]

C[Solicitar confirmación]

D{¿Confirmar reinicio?}

E[Cancelar operación]

F[Reiniciar servicio de monitoreo]

G[Verificar estado del servicio]

H{¿Reinicio exitoso?}

I[Mostrar mensaje de error]

J[Mostrar confirmación]

K([Fin])

A --> B
B --> C
C --> D

D -- No --> E
E --> K

D -- Sí --> F
F --> G
G --> H

H -- No --> I
I --> K

H -- Sí --> J
J --> K
```

# DA-12 - Reiniciar contraseña
```mermaid
flowchart TD

A([Inicio])

B[Seleccionar ¿Olvidó su contraseña?]

C[Ingresar correo electrónico]

D[Validar usuario]

E{¿Usuario registrado?}

F[Mostrar mensaje de error]

G[Iniciar proceso de recuperación]

H[Mostrar confirmación]

I([Fin])

A --> B
B --> C
C --> D
D --> E

E -- No --> F
F --> I

E -- Sí --> G
G --> H
H --> I
```

# DA-13 - Restablecer contraseña
```mermaid
flowchart TD

A([Inicio])

B[Acceder al formulario de restablecimiento]

C[Ingresar nueva contraseña]

D[Confirmar contraseña]

E{¿Coinciden las contraseñas?}

F[Mostrar mensaje de error]

G[Validar políticas de contraseña]

H{¿Contraseña válida?}

I[Mostrar mensaje de error]

J[Actualizar contraseña]

K[Mostrar confirmación]

L([Fin])

A --> B
B --> C
C --> D
D --> E

E -- No --> F
F --> C

E -- Sí --> G
G --> H

H -- No --> I
I --> C

H -- Sí --> J
J --> K
K --> L
```