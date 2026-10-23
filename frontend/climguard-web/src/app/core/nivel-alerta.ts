/* ============================================================
   Cálculo del nivel de peligro de una lectura.

   ⚠️ TEMPORAL — leer esto antes de tocarlo:

   Estos umbrales están escritos aquí porque la API todavía no expone
   el endpoint /api/Umbral. En cuanto Mahuerk lo publique, este archivo
   se BORRA y los umbrales se leen del servidor.

   ¿Por qué no dejarlo así? Porque el enunciado exige poder configurar
   los umbrales desde la aplicación (CFG-RF-001). Si viven en el código
   del navegador, cambiarlos obliga a recompilar y desplegar, y además
   cada usuario podría tener valores distintos. Es una muleta, no la
   solución.
   ============================================================ */

export type Nivel = 'verde' | 'amarillo' | 'naranja' | 'rojo';

/** Hacia dónde se vigila la variable. */
type Direccion = 'sube' | 'baja';

interface ReglaLocal {
  nombre: string;
  unidad: string;
  direccion: Direccion;
  precaucion: number;
  alerta: number;
  emergencia: number;
  fenomeno: string;
}

/**
 * Una regla por tipo de sensor. El id corresponde al TipoSensorId del backend.
 * Fíjate en que Temperatura y Humedad vigilan HACIA ABAJO ('baja'): son los
 * casos de helada y sequía, los que el modelo original no podía detectar.
 */
const REGLAS: Record<number, ReglaLocal> = {

  1: {
    nombre: 'Temperatura',
    unidad: '°C',
    direccion: 'baja',
    precaucion: 5, alerta: 2, emergencia: 0,
    fenomeno: 'Helada'
  },

  2: {
    nombre: 'Humedad',
    unidad: '%',
    direccion: 'baja',
    precaucion: 30, alerta: 20, emergencia: 12,
    fenomeno: 'Incendio forestal'
  },

  3: {
    nombre: 'Viento',
    unidad: 'km/h',
    direccion: 'sube',
    precaucion: 40, alerta: 60, emergencia: 80,
    fenomeno: 'Tormenta'
  },

  4: {
    nombre: 'Lluvia',
    unidad: 'mm',
    direccion: 'sube',
    precaucion: 20, alerta: 50, emergencia: 100,
    fenomeno: 'Tormenta'
  },

  5: {
    nombre: 'Nivel de río',
    unidad: 'm',
    direccion: 'sube',
    precaucion: 3.0, alerta: 3.8, emergencia: 4.5,
    fenomeno: 'Inundación'
  }

};

/**
 * Convierte un valor crudo en uno de los CUATRO niveles del enunciado.
 *
 * El orden de las comparaciones va siempre de lo más grave a lo menos
 * grave. Si se preguntara primero por "precaución", una lectura de
 * emergencia entraría por esa rama y saldría mal clasificada.
 */
export function calcularNivel(tipoSensorId: number, valor: number): Nivel {
  const r = REGLAS[tipoSensorId];
  if (!r) return 'verde';

  if (r.direccion === 'sube') {
    if (valor >= r.emergencia) return 'rojo';
    if (valor >= r.alerta)     return 'naranja';
    if (valor >= r.precaucion) return 'amarillo';
    return 'verde';
  }

  // Vigilancia hacia abajo: cuanto MÁS BAJO, más grave.
  if (valor <= r.emergencia) return 'rojo';
  if (valor <= r.alerta)     return 'naranja';
  if (valor <= r.precaucion) return 'amarillo';
  return 'verde';
}

/** Texto que se muestra en la insignia de color. */
export function textoNivel(nivel: Nivel): string {
  return { verde: 'Normal', amarillo: 'Precaución', naranja: 'Alerta', rojo: 'Emergencia' }[nivel];
}

/** Unidad de medida del sensor, para no mostrar números sueltos. */
export function unidadDe(tipoSensorId: number): string {
  return REGLAS[tipoSensorId]?.unidad ?? '';
}

/** Nombre legible de la variable climática. */
export function variableDe(tipoSensorId: number): string {
  return REGLAS[tipoSensorId]?.nombre ?? 'Desconocida';
}

/** Fenómeno que representa esta variable cuando se dispara. */
export function fenomenoDe(tipoSensorId: number): string {
  return REGLAS[tipoSensorId]?.fenomeno ?? '';
}
