import { evaluarPeligro, type ReglaPeligro } from './peligro';
import { calcularNivel, fijarNiveles, fijarReglas } from './nivel-alerta';

/**
 * Vectores IDÉNTICOS a los de services/alert/src/test/java/com/climguard/alert/RuleEvaluatorSelfTest.java
 * (misma tabla, generada una sola vez). Si cambia la semántica, deben fallar las dos pruebas.
 * Semántica: la regla se activa cuando valor >= min && valor <= max (inclusivo).
 */
interface Vector { nombre: string; reglas: ReglaPeligro[]; tipo: number; valor: number; esperado: number | null; }

const VECTORES: Vector[] = [
  { nombre: "min=35,max=100: 20 no activa", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 4, activo: true }], tipo: 1, valor: 20, esperado: null },
  { nombre: "min=35,max=100: 34.99 no activa", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 4, activo: true }], tipo: 1, valor: 34.99, esperado: null },
  { nombre: "min=35,max=100: 35 activa (limite inferior inclusivo)", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 4, activo: true }], tipo: 1, valor: 35, esperado: 1 },
  { nombre: "min=35,max=100: 35.00 activa (escala decimal distinta)", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 4, activo: true }], tipo: 1, valor: 35.00, esperado: 1 },
  { nombre: "min=35,max=100: 65 activa", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 4, activo: true }], tipo: 1, valor: 65, esperado: 1 },
  { nombre: "min=35,max=100: 100 activa (limite superior inclusivo)", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 4, activo: true }], tipo: 1, valor: 100, esperado: 1 },
  { nombre: "min=35,max=100: 100.01 no activa", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 4, activo: true }], tipo: 1, valor: 100.01, esperado: null },
  { nombre: "min=35,max=100: 101 no activa", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 4, activo: true }], tipo: 1, valor: 101, esperado: null },
  { nombre: "valor negativo fuera de todos los intervalos", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 4, activo: true }], tipo: 1, valor: -5, esperado: null },
  { nombre: "solapadas: 20 solo la regla amplia (nivel 2)", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 3, activo: true }, { reglaAlertaId: 2, tipoSensorId: 1, valorMin: 60, valorMax: 100, nivelAlertaId: 4, activo: true }, { reglaAlertaId: 3, tipoSensorId: 1, valorMin: 0, valorMax: 100, nivelAlertaId: 2, activo: true }], tipo: 1, valor: 20, esperado: 3 },
  { nombre: "solapadas: 35 gana nivel 3 sobre nivel 2", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 3, activo: true }, { reglaAlertaId: 2, tipoSensorId: 1, valorMin: 60, valorMax: 100, nivelAlertaId: 4, activo: true }, { reglaAlertaId: 3, tipoSensorId: 1, valorMin: 0, valorMax: 100, nivelAlertaId: 2, activo: true }], tipo: 1, valor: 35, esperado: 1 },
  { nombre: "solapadas: 59.99 sigue ganando nivel 3", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 3, activo: true }, { reglaAlertaId: 2, tipoSensorId: 1, valorMin: 60, valorMax: 100, nivelAlertaId: 4, activo: true }, { reglaAlertaId: 3, tipoSensorId: 1, valorMin: 0, valorMax: 100, nivelAlertaId: 2, activo: true }], tipo: 1, valor: 59.99, esperado: 1 },
  { nombre: "solapadas: 60 gana nivel 4", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 3, activo: true }, { reglaAlertaId: 2, tipoSensorId: 1, valorMin: 60, valorMax: 100, nivelAlertaId: 4, activo: true }, { reglaAlertaId: 3, tipoSensorId: 1, valorMin: 0, valorMax: 100, nivelAlertaId: 2, activo: true }], tipo: 1, valor: 60, esperado: 2 },
  { nombre: "solapadas: 100 gana nivel 4", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 3, activo: true }, { reglaAlertaId: 2, tipoSensorId: 1, valorMin: 60, valorMax: 100, nivelAlertaId: 4, activo: true }, { reglaAlertaId: 3, tipoSensorId: 1, valorMin: 0, valorMax: 100, nivelAlertaId: 2, activo: true }], tipo: 1, valor: 100, esperado: 2 },
  { nombre: "solapadas: 100.5 fuera de todos", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 3, activo: true }, { reglaAlertaId: 2, tipoSensorId: 1, valorMin: 60, valorMax: 100, nivelAlertaId: 4, activo: true }, { reglaAlertaId: 3, tipoSensorId: 1, valorMin: 0, valorMax: 100, nivelAlertaId: 2, activo: true }], tipo: 1, valor: 100.5, esperado: null },
  { nombre: "empate de nivel: gana el menor id", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 50, valorMax: 70, nivelAlertaId: 3, activo: true }, { reglaAlertaId: 4, tipoSensorId: 1, valorMin: 50, valorMax: 70, nivelAlertaId: 3, activo: true }], tipo: 1, valor: 55, esperado: 1 },
  { nombre: "otro tipo de sensor no activa", reglas: [{ reglaAlertaId: 1, tipoSensorId: 2, valorMin: 0, valorMax: 20, nivelAlertaId: 3, activo: true }, { reglaAlertaId: 2, tipoSensorId: 1, valorMin: 0, valorMax: 100, nivelAlertaId: 4, activo: false }], tipo: 1, valor: 10, esperado: null },
  { nombre: "tipo propio activa", reglas: [{ reglaAlertaId: 1, tipoSensorId: 2, valorMin: 0, valorMax: 20, nivelAlertaId: 3, activo: true }, { reglaAlertaId: 2, tipoSensorId: 1, valorMin: 0, valorMax: 100, nivelAlertaId: 4, activo: false }], tipo: 2, valor: 10, esperado: 1 },
  { nombre: "regla inactiva ignorada", reglas: [{ reglaAlertaId: 2, tipoSensorId: 1, valorMin: 0, valorMax: 100, nivelAlertaId: 4, activo: false }], tipo: 1, valor: 50, esperado: null },
  { nombre: "sensor sin reglas para su tipo", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 4, activo: true }], tipo: 9, valor: 50, esperado: null },
  { nombre: "lista de reglas vacia", reglas: [], tipo: 1, valor: 50, esperado: null },
  { nombre: "min==max: 50 activa", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 50, valorMax: 50, nivelAlertaId: 3, activo: true }], tipo: 1, valor: 50, esperado: 1 },
  { nombre: "min==max: 50.01 no activa", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 50, valorMax: 50, nivelAlertaId: 3, activo: true }], tipo: 1, valor: 50.01, esperado: null },
  { nombre: "intervalo negativo: -50 activa", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: -50, valorMax: 2, nivelAlertaId: 3, activo: true }], tipo: 1, valor: -50, esperado: 1 },
  { nombre: "intervalo negativo: 2 activa", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: -50, valorMax: 2, nivelAlertaId: 3, activo: true }], tipo: 1, valor: 2, esperado: 1 },
  { nombre: "intervalo negativo: 2.01 no activa", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: -50, valorMax: 2, nivelAlertaId: 3, activo: true }], tipo: 1, valor: 2.01, esperado: null },
  { nombre: "intervalo negativo: -50.01 no activa", reglas: [{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: -50, valorMax: 2, nivelAlertaId: 3, activo: true }], tipo: 1, valor: -50.01, esperado: null }
];

describe('evaluarPeligro (misma semántica que RuleEvaluator.java)', () => {
  for (const v of VECTORES) {
    it(v.nombre, () => {
      expect(evaluarPeligro(v.reglas, v.tipo, v.valor)?.reglaAlertaId ?? null).toBe(v.esperado);
    });
  }

  // ---- Reglas LEGADAS (requiereRevision = true): semántica anterior, alerta FUERA de [min,max]. Espejo de RuleEvaluatorSelfTest (A2). ----
  const leg: ReglaPeligro = { reglaAlertaId: 1, tipoSensorId: 1, valorMin: 10, valorMax: 35, nivelAlertaId: 3, activo: true, requiereRevision: true };
  const nueva: ReglaPeligro = { reglaAlertaId: 2, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 4, activo: true };
  const id = (rs: ReglaPeligro[], valor: number) => evaluarPeligro(rs, 1, valor)?.reglaAlertaId ?? null;

  it('legado [10,35]: 20, 10 y 35 (rango normal) no alertan', () => {
    expect(id([leg], 20)).toBeNull();
    expect(id([leg], 10)).toBeNull();
    expect(id([leg], 35)).toBeNull();
  });
  it('legado [10,35]: 9.99 y 35.01 alertan (se sigue evaluando con su semántica original)', () => {
    expect(id([leg], 9.99)).toBe(1);
    expect(id([leg], 35.01)).toBe(1);
  });
  it('legado inactivo se ignora', () => {
    expect(id([{ ...leg, activo: false }], 50)).toBeNull();
  });
  it('mixto legado + nueva: 40 gana la nueva (nivel 4), 35 solo la nueva, 5 solo el legado, 20 nada', () => {
    expect(id([leg, nueva], 40)).toBe(2);
    expect(id([leg, nueva], 35)).toBe(2);
    expect(id([leg, nueva], 5)).toBe(1);
    expect(id([leg, nueva], 20)).toBeNull();
  });
  it('mixto con empate de nivel: gana el menor id', () => {
    expect(id([{ ...leg, reglaAlertaId: 5 }, { ...nueva, reglaAlertaId: 2, valorMin: 50, nivelAlertaId: 3 }], 60)).toBe(2);
  });
  it('convertir la regla (requiereRevision=false) cambia la semántica: [10,35] pasa a ser zona de peligro', () => {
    expect(id([{ ...leg, requiereRevision: false }], 20)).toBe(1);
    expect(id([{ ...leg, requiereRevision: false }], 5)).toBeNull();
  });

  it('un valor no numérico no genera condición de peligro', () => {
    const r: ReglaPeligro = { reglaAlertaId: 1, tipoSensorId: 1, valorMin: 0, valorMax: 100, nivelAlertaId: 3, activo: true };
    expect(evaluarPeligro([r], 1, NaN)).toBeNull();
  });
});

describe('calcularNivel (semáforo del dashboard)', () => {
  beforeEach(() => {
    fijarNiveles([
      { nivelAlertaId: 1, colorHex: '#28A745' }, { nivelAlertaId: 2, colorHex: '#FFC107' },
      { nivelAlertaId: 3, colorHex: '#FD7E14' }, { nivelAlertaId: 4, colorHex: '#DC3545' }
    ]);
    fijarReglas([{ reglaAlertaId: 1, tipoSensorId: 1, valorMin: 35, valorMax: 100, nivelAlertaId: 4, activo: true }]);
  });

  it('Temperatura elevada [35,100] Emergencia: 20 verde, 35/65/100 rojo, 101 verde', () => {
    expect(calcularNivel(1, 20)).toBe('verde');
    expect(calcularNivel(1, 35)).toBe('rojo');
    expect(calcularNivel(1, 65)).toBe('rojo');
    expect(calcularNivel(1, 100)).toBe('rojo');
    expect(calcularNivel(1, 101)).toBe('verde');
  });

  it('sensor sin reglas para su tipo queda en verde', () => {
    expect(calcularNivel(9, 999)).toBe('verde');
  });
});
