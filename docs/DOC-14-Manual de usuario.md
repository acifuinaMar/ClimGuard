# ClimGuard
## Manual de Usuario

| Proyecto | ClimGuard |
|-----------|-----------|
| Documento | Manual de Usuario |
| Código | DOC-14 |
| Versión | 3.0 |
| Estado | Vigente (ClimGuard 4.1) |

### Historial de versiones
| Versión | Fecha | Cambios |
|---|---|---|
| 1.0 – 2.0 | Agosto – octubre 2026 | Inicio de sesión, panel, comunidades, sensores, reglas, alertas y bitácora del monolito de la Fase 2. |
| 3.0 | Noviembre 2026 | Actualizado para ClimGuard 4.1: inicio de sesión con Google y GitHub, roles y permisos, mapa, usuarios, historial, tipos de fenómeno, reportes PDF, origen físico o simulado de los sensores y desplegables de comunidad, departamento y municipio. |

---

# Tabla de contenido
1. [Introducción](#1-introducción)
2. [Acceso al sistema](#2-acceso-al-sistema)
3. [Roles y permisos](#3-roles-y-permisos)
4. [Elementos comunes de la interfaz](#4-elementos-comunes-de-la-interfaz)
5. [Panel de monitoreo](#5-panel-de-monitoreo)
6. [Mapa](#6-mapa)
7. [Sensores](#7-sensores)
8. [Comunidades](#8-comunidades)
9. [Reglas de alerta](#9-reglas-de-alerta)
10. [Alertas](#10-alertas)
11. [Historial de eventos](#11-historial-de-eventos)
12. [Tipos de fenómeno](#12-tipos-de-fenómeno)
13. [Usuarios](#13-usuarios)
14. [Reportes](#14-reportes)
15. [Bitácora](#15-bitácora)
16. [Cierre de sesión](#16-cierre-de-sesión)
17. [Solución de problemas](#17-solución-de-problemas)

---

# 1. Introducción
ClimGuard es una plataforma web de monitoreo climático y alerta temprana. Muestra en tiempo real las lecturas de sensores instalados en comunidades, genera alertas cuando una lectura entra en una zona de peligro y permite atenderlas, consultar su historial y generar reportes en PDF.

Este manual describe cada pantalla y los pasos para usarla. Lo que cada persona ve depende de su rol (sección 3).

# 2. Acceso al sistema
Dirección: <https://climguard.acifuina.online>. Se recomienda un navegador actualizado (Chrome, Edge o Firefox).

## 2.1 Iniciar sesión con usuario y contraseña
1. Escriba su **Usuario** (al menos 3 caracteres).
2. Escriba su **Contraseña** (al menos 6 caracteres).
3. Pulse **Entrar**.

Si los datos no son correctos, el sistema muestra «Usuario o contraseña incorrectos». Las cuentas con usuario y contraseña las crea un Administrador (sección 13).

## 2.2 Iniciar sesión con Google o GitHub
Debajo del formulario, en «o continúa con», aparecen los botones de los proveedores habilitados.
1. Pulse **Google** o **GitHub**.
2. El navegador lo lleva a la página del proveedor; inicie sesión allí y autorice el acceso.
3. El proveedor lo devuelve a ClimGuard y entra al panel.

Si es la primera vez y el auto-registro está habilitado, ClimGuard crea su cuenta con el rol **Consulta** (solo lectura). Un Administrador puede cambiarle el rol después.

Mensajes posibles al volver del proveedor:

| Mensaje | Qué significa |
|---|---|
| Tu cuenta externa no está registrada en ClimGuard. Pide acceso a un administrador. | El auto-registro está deshabilitado y su cuenta no existe |
| Tu cuenta está desactivada. Contacta a un administrador. | Su usuario existe pero está inactivo |
| El proveedor no confirmó un correo verificado para tu cuenta. | Debe verificar su correo en Google o GitHub (en GitHub, el correo principal) |
| El dominio de tu correo no está autorizado para registrarse. | El sistema solo admite ciertos dominios de correo |
| Esa cuenta externa ya está vinculada a otro usuario. | La cuenta de Google o GitHub pertenece a otro usuario de ClimGuard |
| El proveedor canceló o rechazó el inicio de sesión. | Se canceló la autorización en la página del proveedor |
| La sesión de inicio expiró o no es válida. / El código de acceso expiró o ya fue usado. | Pasó demasiado tiempo o se repitió el proceso; inténtelo de nuevo |
| No se pudo contactar al proveedor. / No se pudo validar la respuesta del proveedor. | Problema temporal de comunicación; inténtelo de nuevo |

## 2.3 Vincular una cuenta de Google o GitHub
Un usuario que ya entra con usuario y contraseña puede vincular su cuenta externa para usarla después.
1. Inicie sesión con usuario y contraseña.
2. En el **Panel**, sección **Mi cuenta**, pulse el botón de Google o de GitHub.
3. Inicie sesión en el proveedor y autorice. Desde ese momento puede entrar también con ese botón.

## 2.4 Duración de la sesión
La sesión dura un tiempo limitado (30 minutos en la configuración actual). Cuando vence, el sistema lo devuelve a la pantalla de inicio de sesión; si había intentado abrir una página concreta, después de entrar lo lleva a ella.

# 3. Roles y permisos
| Pantalla / acción | Administrador | Operador | Consulta |
|---|:-:|:-:|:-:|
| Panel y Mapa | ✔ | ✔ | ✔ |
| Ver sensores, comunidades y reglas | ✔ | ✔ | ✔ |
| Crear, editar, activar o desactivar sensores | ✔ | | |
| Crear, editar y eliminar comunidades | ✔ | | |
| Crear y editar reglas de alerta | ✔ | | |
| Ver alertas e historial de eventos | ✔ | ✔ | |
| Atender alertas | ✔ | ✔ | |
| Gestionar tipos de fenómeno | ✔ | ✔ | |
| Gestionar usuarios | ✔ | | |
| Generar, consultar y descargar reportes | ✔ | | |
| Consultar la bitácora | ✔ | | |

El menú lateral solo muestra las opciones permitidas para su rol. Los sensores ESP8266 usan una cuenta de servicio con rol Operador para enviar lecturas; esa cuenta no debe usarse para trabajar en la interfaz.

# 4. Elementos comunes de la interfaz
- **Menú lateral:** Panel, Mapa, Sensores, Reglas de alerta, Alertas, Comunidades, Tipos de fenómeno, Usuarios, Historial, Reportes y Bitácora (según el rol). En pantallas pequeñas se abre con el botón **☰**.
- **Botón Salir:** cierra la sesión (sección 16).
- **Aviso de emergencia:** cuando llega una alerta de nivel crítico, aparece un aviso destacado con el símbolo ⚠ y suena una alarma. Pulse **Entendido** para silenciarla. El sonido se habilita después de iniciar sesión.
- **«Datos de ejemplo»:** si el servidor no responde, algunas pantallas muestran datos de ejemplo con esa etiqueta. No son datos reales; pulse **Reintentar** o recargue la página cuando el servicio vuelva.
- **Niveles de alerta (colores):** Normal (verde), Precaución (amarillo), Alerta (naranja) y Emergencia (rojo).

# 5. Panel de monitoreo
Es la pantalla inicial. Muestra el estado actual de los sensores.

- **Indicador de conexión:** «● En vivo» cuando recibe datos en tiempo real; «○ Periódico» cuando se actualiza a intervalos. Junto a él aparece la hora de la **Última actualización**.
- **Alertas activas:** lista de alertas pendientes; si no hay, muestra «No existen alertas activas».
- **Sensores, En riesgo y En emergencia:** cantidad de sensores y cuántos están en zona de riesgo o de emergencia.
- **Tarjetas de sensores:** nombre, valor actual con su unidad, nivel (color) y estado **En línea** o **Fuera de línea**.
- **Evolución de los sensores:** gráfica con las lecturas recientes.
- **Mi cuenta:** vinculación de cuentas de Google o GitHub (sección 2.3).

Las lecturas nuevas aparecen sin recargar la página.

# 6. Mapa
Muestra las comunidades y sus sensores sobre un mapa, coloreados según su nivel de alerta (leyenda: Normal, Precaución, Alerta, Emergencia).
1. Abra **Mapa** en el menú.
2. Acerque o aleje con la rueda del ratón o los botones del mapa.
3. Pulse un marcador para ver su información.

Las comunidades aparecen en el mapa según la latitud y longitud registradas (sección 8).

# 7. Sensores
Lista de sensores con las columnas **Sensor**, **Origen**, **Variable**, **Lectura**, **Nivel** y **Acciones**. La columna de comunidad muestra su nombre.

**Origen de las lecturas**
- **Físico:** las lecturas las envía un dispositivo real (ESP8266).
- **Simulado:** el sistema genera lecturas automáticamente mientras el sensor esté activo.
El origen no depende del estado: puede haber sensores físicos y simulados activos a la vez.

## 7.1 Registrar un sensor (Administrador)
1. Pulse **+ Nuevo sensor**.
2. Complete el formulario:
   - **Nombre del sensor** (obligatorio, al menos 3 caracteres).
   - **Código** (obligatorio), por ejemplo `TMP-001`.
   - **Variable que mide**: temperatura, humedad, lluvia, nivel de río, etc.
   - **Comunidad**: elija una de la lista, que muestra las comunidades **activas** ordenadas por nombre. Si no hay ninguna, el formulario indica «No hay comunidades activas. Registre una primero.» (sección 8).
   - **Estado**: Activo, Inactivo, Mantenimiento o Fuera de línea.
   - **Origen de las lecturas**: **Físico** o **Simulado** (obligatorio; no tiene valor por defecto).
   - **Ubicación** y **Descripción** (obligatorias).
   - **Valor actual**: campo informativo con la lectura del momento. El valor real del sensor lo determinan sus lecturas; lo que se escriba aquí no lo modifica.
3. Pulse **Guardar**.

## 7.2 Editar un sensor (Administrador)
1. Pulse **Editar** en la fila del sensor.
2. Modifique los datos y pulse **Guardar**.
Al editar, la comunidad actual del sensor se conserva en la lista aunque esté inactiva, para no cambiarla por error.

## 7.3 Activar o desactivar un sensor (Administrador)
Pulse **Desactivar** o **Activar** en la fila del sensor. Un sensor inactivo deja de recibir lecturas simuladas y no se evalúa. La interfaz no ofrece eliminar sensores: desactívelos.

# 8. Comunidades
Cada comunidad aparece en una tarjeta con su nombre, ubicación y coordenadas.

## 8.1 Registrar una comunidad (Administrador)
1. Pulse **+ Nueva comunidad**.
2. Complete el formulario:
   - **Nombre de la comunidad** (obligatorio, al menos 3 caracteres).
   - **País**: por defecto «Guatemala».
   - **Departamento** y **Municipio**: con Guatemala son listas en cascada. Elija primero el departamento; la lista de municipios se llena con los de ese departamento. Si cambia el departamento, el municipio se borra y debe elegirlo de nuevo.
     Si escribe otro país, departamento y municipio pasan a ser campos de texto libre.
   - **Descripción**.
   - **Latitud** (entre −90 y 90) y **Longitud** (entre −180 y 180): ubican la comunidad en el mapa.
3. Pulse **Guardar**.

## 8.2 Editar una comunidad (Administrador)
1. Pulse **Editar** en la tarjeta.
2. Modifique los datos y pulse **Guardar**.
Si la comunidad tiene guardado un departamento o municipio que no está en el catálogo (por ejemplo, escrito sin tilde), la lista lo muestra como «(valor guardado)» para que no se pierda; puede conservarlo o elegir uno del catálogo.

## 8.3 Eliminar una comunidad (Administrador)
1. Pulse **Eliminar** en la tarjeta.
2. Confirme en el mensaje «¿Eliminar esta comunidad?». La acción no se puede deshacer.
Si la comunidad tiene sensores asociados, el sistema no la elimina e indica cuántos tiene: desactívela o reasigne sus sensores primero.

# 9. Reglas de alerta
Una regla indica cuándo una lectura es peligrosa. Columnas: **Regla**, **Intervalo**, **Nivel**, **Fenómeno**, **Estado** y **Acciones**.

**Cómo se evalúan:** una regla se activa cuando la lectura está **dentro** del intervalo `[mínimo, máximo]`, con los extremos incluidos. Ejemplo: mínimo 35 y máximo 100 en temperatura → 20 no activa; 35, 65 y 100 sí; 101 no. Si varias reglas se activan a la vez, gana la de nivel más alto.

## 9.1 Crear una regla (Administrador)
1. Pulse **+ Nueva regla**.
2. Complete:
   - **Nombre de la regla** (obligatorio, al menos 3 caracteres).
   - **Tipo de sensor** al que se aplica.
   - **Mínimo (activa desde)** y **Máximo (activa hasta)**. El mínimo no puede ser mayor que el máximo.
   - **Nivel de peligro** y **Tipo de fenómeno**.
   - **Mensaje de la alerta** (obligatorio): texto que verá quien reciba la alerta.
   - **Regla activa**: desmárquela para guardar la regla sin que se aplique.
3. Pulse **Guardar**.

## 9.2 Editar una regla (Administrador)
Pulse **Editar**, cambie los datos y pulse **Guardar**. Para dejar de aplicar una regla sin borrarla, desmarque **Regla activa**.

## 9.3 Reglas con la semántica anterior
Las reglas que vienen de versiones anteriores pueden estar marcadas como **Semántica anterior**: generan la alerta cuando la lectura queda **fuera** de su rango normal. La pantalla muestra un aviso con cuántas quedan. Se siguen evaluando así hasta que se conviertan:
1. Pulse **Editar** en la regla.
2. Marque **Convertir a la semántica nueva**.
3. Indique el intervalo que debe **activar** la alerta y pulse **Guardar**.
Editar una regla de este tipo sin marcar la casilla no cambia su significado.

# 10. Alertas
Muestra las **alertas activas** que requieren atención: fenómeno, nivel, sensor, comunidad, valor detectado, mensaje y fecha. Si no hay, indica «No hay alertas activas».

## Atender una alerta (Administrador u Operador)
1. Revise la alerta.
2. Pulse **Atender**. La alerta pasa a estado *Atendida*, sale de la lista de activas y queda en el historial (sección 11) con el nombre del responsable.

Las alertas se generan solas: no es necesario crearlas.

# 11. Historial de eventos
Lista todos los eventos de riesgo detectados, activos y atendidos.
- En la parte superior aparecen los totales de **Activos** y **Atendidos**.
- **Filtros:** Fecha, Comunidad, Fenómeno y Nivel. **Limpiar filtros** los quita.
- Columnas: Fecha / Hora, Sensor, Valor, Descripción, Estado y Responsable.
Si ningún evento cumple los filtros, muestra «No hay eventos con esos filtros».

# 12. Tipos de fenómeno
Catálogo de fenómenos climáticos (por ejemplo, helada, sequía, inundación) que se asocian a las reglas y alertas.
- **Crear:** pulse **+ Nuevo tipo**, escriba el **Nombre del fenómeno** (al menos 3 caracteres), deje marcado **Activo** y pulse **Guardar**.
- **Editar:** pulse **Editar**, cambie el nombre o el estado y pulse **Guardar**.
- **Eliminar:** pulse **Eliminar** y confirme. La acción no se puede deshacer.

# 13. Usuarios
Lista de personas con acceso: **Usuario**, **Cuenta**, **Estado** y **Acciones**. Las cuentas inactivas se marcan como *Inactivo*.

## 13.1 Crear un usuario (Administrador)
1. Pulse **+ Nuevo usuario**.
2. Complete:
   - **Nombre completo** (al menos 3 caracteres).
   - **Usuario (para iniciar sesión)** (al menos 3 caracteres).
   - **Rol**: Administrador, Operador o Consulta (sección 3).
   - **Contraseña** (al menos 6 caracteres). Use una contraseña robusta y no la comparta.
   - **Usuario activo**: desmárquelo para crear la cuenta sin acceso.
3. Pulse **Guardar**.

## 13.2 Editar un usuario o cambiar su rol (Administrador)
1. Pulse **Editar**.
2. Cambie el nombre, el rol o el estado.
3. Escriba la **Contraseña**: el formulario la exige y la guarda como la nueva contraseña del usuario.
4. Pulse **Guardar**.

Las personas que entraron por primera vez con Google o GitHub aparecen con el rol Consulta; si necesitan más permisos, edítelas y asigne el rol adecuado. Para retirar el acceso a alguien, desmarque **Usuario activo**.

# 14. Reportes
Genera reportes en PDF desde el servidor y conserva su historial (solo Administrador).

## 14.1 Generar un reporte
1. En **Nuevo reporte**, elija el **Tipo de reporte**: Comunidades, Sensores, Lecturas, Alertas, Historial de eventos, Estado de sensores, Estadísticas climáticas o Ejecutivo.
2. Complete los filtros que aparecen para ese tipo (comunidad, sensor, tipo, estado, nivel, fenómeno, rango de fechas). Los que deje en «Todas» o vacíos no filtran. En el reporte de lecturas, si no indica fechas se toma el último día.
3. Pulse **Generar PDF**. Mientras se procesa, el botón indica «Generando…».

Si el reporte tendría más filas que el límite permitido, el sistema no lo genera e indica el límite y el total: acote los filtros (por ejemplo, un rango de fechas menor o una sola comunidad). Si hay demasiados reportes en proceso, espere un momento y vuelva a intentarlo.

## 14.2 Historial y descarga
La tabla **Historial** muestra Identificador (por ejemplo `REP-2026-000042`), Tipo, Generado por, Fecha, Filtros, Estado y Tamaño.
- Pulse **Descargar** para obtener el PDF de un reporte terminado.
- Use **Anterior** y **Siguiente** para recorrer las páginas del historial.

# 15. Bitácora
Registro de las acciones realizadas por los usuarios (solo Administrador): **Usuario**, **Acción**, **Entidad**, **Detalle**, **Tipo** y **Fecha**. Incluye inicios de sesión, también los fallidos, y las altas y cambios de datos. Es de solo lectura.

# 16. Cierre de sesión
Pulse **Salir** en el encabezado. Cierre la sesión al terminar, en especial en equipos compartidos.

# 17. Solución de problemas
| Situación | Qué hacer |
|---|---|
| No puedo iniciar sesión | Revise usuario y contraseña (mayúsculas incluidas). Si la cuenta está inactiva o la olvidó, pida a un Administrador que la reactive o le asigne una contraseña nueva. Tras varios intentos seguidos, espere un minuto. |
| El botón de Google o GitHub no aparece | El proveedor no está habilitado en el servidor; use usuario y contraseña o contacte al Administrador. |
| Entré con Google o GitHub y no veo casi nada | Las cuentas nuevas tienen rol Consulta; pida a un Administrador el rol que necesita. |
| Me devuelve a la pantalla de inicio | La sesión venció; vuelva a iniciar sesión. |
| No aparece una opción del menú | Su rol no tiene ese permiso (sección 3). |
| El panel no se actualiza solo (aparece «○ Periódico») | Se perdió la conexión en tiempo real; los datos se siguen actualizando a intervalos. Recargue la página. |
| Veo la etiqueta «Datos de ejemplo» | El servidor no respondió; pulse **Reintentar** más tarde. |
| Un sensor no muestra lecturas | Compruebe que esté **Activo**. Si es **Simulado**, las lecturas aparecen en pocos segundos; si es **Físico**, depende de que el dispositivo esté encendido y conectado. |
| No se generan alertas | Verifique que exista una regla **activa** para ese tipo de sensor y que el intervalo cubra los valores peligrosos. |
| No puedo elegir comunidad al registrar un sensor | No hay comunidades activas; registre o active una. |
| No puedo eliminar una comunidad | Tiene sensores asociados; desactívela o reasigne los sensores. |
| Un reporte indica que supera el límite | Acote los filtros, por ejemplo un rango de fechas menor. |
| No suena la alarma | El navegador bloquea el sonido hasta que se interactúa con la página; inicie sesión y mantenga la pestaña abierta. |
