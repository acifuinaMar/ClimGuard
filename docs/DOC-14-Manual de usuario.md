# ClimGuard
## Manual de Usuario

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Manual de Usuario |
| Código | DOC-14 |
| Versión | 2.0 |
| Estado | Finalizado |

---

# Tabla de Contenido

1. Introducción
2. Acceso al Sistema
3. Inicio de Sesión
4. Dashboard
5. Gestión de Comunidades
6. Gestión de Sensores
7. Configuración de Umbrales
8. Alertas
9. Bitácora
10. Cierre de Sesión
11. Recomendaciones de Uso
12. Solución de Problemas Frecuentes

---

# 1. Introducción

El presente manual describe el funcionamiento general del sistema **ClimGuard**, proporcionando al usuario las instrucciones necesarias para utilizar las funcionalidades implementadas en el segundo release.

ClimGuard es una plataforma web orientada al monitoreo climático en tiempo real, permitiendo visualizar información proveniente de sensores ambientales, detectar condiciones de riesgo y administrar la información relacionada con comunidades, sensores y alertas.

---

# 2. Acceso al Sistema

Para acceder al sistema es necesario disponer de un usuario y contraseña válidos.

El acceso se realiza desde la pantalla principal de inicio de sesión.

Los usuarios disponibles dependerán de la configuración realizada por el administrador de la base de datos.

---

# 3. Inicio de Sesión

## Procedimiento

1. Ingresar el nombre de usuario.
2. Ingresar la contraseña.
3. Presionar el botón **Iniciar sesión**.
4. Esperar la validación de las credenciales.
5. El sistema mostrará el Dashboard correspondiente.

Si las credenciales son incorrectas, el sistema mostrará un mensaje indicando que el acceso fue rechazado.

---

# 4. Dashboard

El Dashboard constituye la pantalla principal del sistema.

Desde esta vista el usuario podrá visualizar:

- Indicadores generales del sistema.
- Gráfica de monitoreo.
- Comunidades registradas.
- Estado de los sensores.
- Alertas activas.

La información mostrada se actualiza automáticamente mediante SignalR.
La información presentada en el Dashboard se actualiza automáticamente mediante SignalR y refleja las lecturas generadas por el servicio de simulación integrado en el sistema.

---

# 5. Gestión de Comunidades

Este módulo permite administrar las comunidades monitoreadas.

Las operaciones disponibles son:

- Registrar una comunidad.
- Modificar una comunidad.
- Eliminar una comunidad.

## Registrar una comunidad

1. Acceder al módulo **Comunidades**.
2. Seleccionar **Nueva Comunidad**.
3. Completar la información solicitada.
4. Guardar los cambios.

## Modificar una comunidad

1. Seleccionar la comunidad.
2. Presionar **Editar**.
3. Actualizar la información.
4. Guardar.

## Eliminar una comunidad

1. Seleccionar la comunidad.
2. Presionar **Eliminar**.
3. Confirmar la operación.

---

# 6. Gestión de Sensores

Este módulo permite administrar los sensores registrados.

Las operaciones disponibles son:

- Registrar sensores.
- Modificar sensores.
- Activar sensores.
- Desactivar sensores.

> Antes de registrar un sensor deben existir previamente una comunidad, un tipo de sensor y un estado de sensor registrados en el sistema.

## Registrar un sensor

1. Acceder al módulo **Sensores**.
2. Seleccionar **Nuevo Sensor**.
3. Completar la información requerida.
4. Guardar.

## Activar o desactivar un sensor

1. Seleccionar el sensor.
2. Cambiar su estado.
3. Guardar los cambios.

Los sensores no son eliminados físicamente del sistema.

---

# 7. Configuración de Reglas de Alerta
Las reglas de alerta determinan las condiciones bajo las cuales el sistema generará automáticamente una alerta.

Para configurar una regla:

1. Acceder al módulo **Reglas de Alerta**.
2. Seleccionar el tipo de sensor.
3. Definir:
   - Valor mínimo.
   - Valor máximo.
   - Nivel de alerta.
   - Tipo de fenómeno.
   - Mensaje.
4. Guardar los cambios.

> Las modificaciones afectarán únicamente las lecturas procesadas posteriormente, manteniendo intactas las alertas históricas gracias al uso de snapshots.

---

# 8. Alertas

Cuando una lectura supera los valores configurados, el sistema genera automáticamente una alerta.
Las alertas son generadas automáticamente por el servicio de simulación del sistema, el cual evalúa periódicamente las reglas configuradas para cada tipo de sensor.

Cada alerta muestra información como:

- Comunidad.
- Sensor.
- Tipo de fenómeno.
- Nivel de alerta.
- Fecha y hora.
- Mensaje generado.

Los niveles utilizados son:

| Nivel | Significado |
|--------|-------------|
| Verde | Condición normal. |
| Amarillo | Condición de precaución. |
| Naranja | Condición de alerta. |
| Rojo | Condición de emergencia. |

Las alertas activas pueden consultarse desde el Dashboard.

---

# 9. Bitácora

La bitácora registra automáticamente las acciones administrativas realizadas dentro del sistema.

Únicamente los usuarios con permisos de administrador pueden acceder a este módulo.

La información registrada incluye:

- Usuario.
- Acción realizada.
- Fecha.
- Hora.

---

# 10. Cierre de Sesión

Para finalizar la sesión:

1. Seleccionar la opción **Cerrar sesión**.
2. Confirmar la operación si el sistema lo solicita.

Una vez finalizada la sesión será necesario autenticarse nuevamente para continuar utilizando el sistema.

---

# 11. Recomendaciones de Uso

Se recomienda:

- Mantener actualizada la información de comunidades y sensores.
- Revisar periódicamente las alertas activas.
- Verificar periódicamente las reglas de alerta configuradas para cada tipo de sensor.
- Cerrar la sesión al finalizar el uso del sistema.
- Utilizar navegadores actualizados para garantizar el correcto funcionamiento de la aplicación.

---

# 12. Solución de Problemas Frecuentes

## No puedo iniciar sesión

Verifique que el nombre de usuario y la contraseña sean correctos.

Si el problema continúa, comuníquese con el administrador del sistema.

---

## No aparecen lecturas

Verifique que existan sensores registrados y que se encuentren activos.

---

## No se generan alertas

Revise la configuración de las reglas de alerta y confirme que las lecturas se encuentren dentro del rango definido para generar una alerta.

---

## No se actualiza el Dashboard

Verifique la conexión con el servidor y actualice la página si el problema persiste.

---

## No puedo registrar un sensor

Verifique que existan previamente comunidades, tipos de sensor y estados de sensor registrados en el sistema, ya que estos son requisitos para la creación de un nuevo sensor.

---

# Observaciones

- El presente manual corresponde al segundo release del sistema ClimGuard.
- Las lecturas son generadas automáticamente mediante un Background Service que simula el comportamiento de los sensores registrados.
- Las futuras versiones incorporarán integración con sensores físicos y nuevas opciones de monitoreo.