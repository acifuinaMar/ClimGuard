/* ============================================================
   Nivel de peligro de una lectura, para pintar semáforos, mapa y panel.

   Ya NO hay umbrales escritos en el navegador. El nivel sale de las reglas de
   alerta del servidor (las mismas que usa el backend para crear alertas),
   evaluadas con core/peligro.ts. PeligroService carga las reglas y las deja
   aquí con fijarReglas().

   Qué es cada cosa (no confundir):
   - NIVEL DE PELIGRO de la lectura: existe mientras el valor esté dentro del
     intervalo [min, max] de alguna regla activa. Es lo que muestra este archivo.
   - ALERTA creada: la crea el backend al detectar la condición, pero el
     enfriamiento (cooldown, 60 s por sensor y regla por defecto) puede evitar
     una alerta nueva mientras la condición de peligro sigue vigente.
   ============================================================ */

import { evaluarPeligro, type ReglaPeligro } from './peligro';

export type Nivel = 'verde' | 'amarillo' | 'naranja' | 'rojo';

let reglasVigentes: ReglaPeligro[] = [];
let nivelPorId = new Map<number, Nivel>();

const POR_DEFECTO_ID: Record<number, Nivel> = { 1: 'verde', 2: 'amarillo', 3: 'naranja', 4: 'rojo' };
const POR_COLOR: Record<string, Nivel> = { '#28A745': 'verde', '#FFC107': 'amarillo', '#FD7E14': 'naranja', '#DC3545': 'rojo' };

/** Reemplaza las reglas con las que se calcula el nivel (las entrega PeligroService). */
export function fijarReglas(reglas: ReglaPeligro[]): void {
  reglasVigentes = reglas;
}

/** Asocia cada nivelAlertaId del servidor con el color del semáforo (por su colorHex; si no, por id 1..4). */
export function fijarNiveles(niveles: { nivelAlertaId: number; colorHex: string }[]): void {
  nivelPorId = new Map(niveles.map(n => [n.nivelAlertaId, POR_COLOR[n.colorHex?.toUpperCase()] ?? POR_DEFECTO_ID[n.nivelAlertaId] ?? 'verde']));
}

/** Regla que provoca la condición de peligro de la lectura (o null). */
export function reglaDePeligro(tipoSensorId: number, valor: number): ReglaPeligro | null {
  return evaluarPeligro(reglasVigentes, tipoSensorId, Number(valor));
}

/** Nivel de semáforo de la lectura: 'verde' si no hay condición de peligro. */
export function calcularNivel(tipoSensorId: number, valor: number): Nivel {
  const r = reglaDePeligro(tipoSensorId, valor);
  if (!r) return 'verde';
  return nivelPorId.get(r.nivelAlertaId) ?? POR_DEFECTO_ID[r.nivelAlertaId] ?? 'verde';
}

/** Texto que se muestra en la insignia de color. */
export function textoNivel(nivel: Nivel): string {
  return { verde: 'Normal', amarillo: 'Precaución', naranja: 'Alerta', rojo: 'Emergencia' }[nivel];
}

/* ---- Metadatos de presentación por tipo de sensor (NO son umbrales) ---- */
const META: Record<number, { nombre: string; unidad: string; fenomeno: string }> = {
  1: { nombre: 'Temperatura',         unidad: '°C',   fenomeno: 'Helada / Incendio forestal' },
  2: { nombre: 'Humedad',             unidad: '%',    fenomeno: 'Sequía' },
  3: { nombre: 'Viento',              unidad: 'km/h', fenomeno: 'Tormenta' },
  4: { nombre: 'Lluvia',              unidad: 'mm',   fenomeno: 'Tormenta' },
  5: { nombre: 'Nivel de río',        unidad: 'm',    fenomeno: 'Inundación' },
  6: { nombre: 'Nivel de reservorio', unidad: 'm',    fenomeno: '' },
  7: { nombre: 'Humo / Incendio',     unidad: 'ppm',  fenomeno: 'Incendio forestal' },
  8: { nombre: 'Otro',                unidad: '',     fenomeno: '' }
};

/** Unidad de medida del sensor, para no mostrar números sueltos. */
export function unidadDe(tipoSensorId: number): string {
  return META[tipoSensorId]?.unidad ?? '';
}

/** Nombre legible de la variable climática. */
export function variableDe(tipoSensorId: number): string {
  return META[tipoSensorId]?.nombre ?? 'Desconocida';
}

/** Fenómeno asociado a la variable (solo orientativo; el real lo define cada regla). */
export function fenomenoDe(tipoSensorId: number): string {
  return META[tipoSensorId]?.fenomeno ?? '';
}
