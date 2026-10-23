import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { ReglaAlerta } from '../../core/models/regla-alerta.model';
import { NivelAlertaCat, TipoFenomenoCat, TipoSensorCat } from '../../core/models/catalogo.model';
import { ReglaAlertaService } from '../../core/services/regla-alerta.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { SiPermisoDirective } from '../../shared/si-permiso.directive';
import { ReglaForm } from './regla-form';
import { detalleError } from '../../core/http-error';

/* ============================================================
   REGLAS DE ALERTA (Fase 2, RF-ADM-29 a 35)
   ------------------------------------------------------------
   Lista las reglas que disparan las alertas y permite editarlas (solo el
   Administrador). El backend permite crear, editar y borrar; para apagar una
   regla sin borrarla, se edita su campo "activa".

   Consume los endpoints reales (ReglaAlerta, NivelAlerta, TipoFenomeno). Si el
   backend no responde, muestra reglas de ejemplo para poder verlo; al conectarlo,
   usa los datos reales sin tocar nada.
   ============================================================ */
@Component({
  selector: 'app-reglas-page',
  imports: [SiPermisoDirective, ReglaForm],
  templateUrl: './reglas-page.html',
  styleUrl: './reglas-page.scss',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class ReglasPage {
  private reglaService = inject(ReglaAlertaService);
  private catalogo = inject(CatalogoService);

  reglas = signal<ReglaAlerta[]>([]);
  niveles = signal<NivelAlertaCat[]>([]);
  fenomenos = signal<TipoFenomenoCat[]>([]);
  tiposSensor = signal<TipoSensorCat[]>([]);

  cargando = signal(true);
  error = signal<string | null>(null);
  usandoEjemplo = signal(false);

  formAbierto = signal(false);
  reglaEditando = signal<ReglaAlerta | null>(null);
  guardando = signal(false);
  aviso = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      reglas: this.reglaService.listar().pipe(timeout(5000), catchError(() => of<ReglaAlerta[]>([]))),
      niveles: this.catalogo.nivelesAlerta(),
      fenomenos: this.catalogo.tiposFenomeno(),
      tipos: this.catalogo.tiposSensor()
    }).subscribe({
      next: ({ reglas, niveles, fenomenos, tipos }) => {
        this.niveles.set(niveles);
        this.fenomenos.set(fenomenos);
        this.tiposSensor.set(tipos);

        if (reglas.length === 0) {
          this.reglas.set(this.reglasEjemplo());
          this.usandoEjemplo.set(true);
        } else {
          this.reglas.set(reglas);
          this.usandoEjemplo.set(false);
        }
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las reglas.');
        this.cargando.set(false);
      }
    });
  }

  // ---- Nombres y color para la tabla (buscan en los catálogos) ----
  nombreNivel(id: number): string {
    return this.niveles().find(n => n.nivelAlertaId === id)?.nombre ?? `Nivel ${id}`;
  }
  colorNivel(id: number): string {
    return this.niveles().find(n => n.nivelAlertaId === id)?.colorHex ?? '#94a3b8';
  }
  nombreFenomeno(id: number): string {
    return this.fenomenos().find(f => f.tipoFenomenoId === id)?.nombre ?? `Fenómeno ${id}`;
  }
  nombreTipoSensor(id: number): string {
    return this.tiposSensor().find(t => t.tipoSensorId === id)?.nombre ?? `Tipo ${id}`;
  }

  // ---- Crear / editar ----
  nuevo(): void {
    this.reglaEditando.set(null);
    this.formAbierto.set(true);
  }
  editar(r: ReglaAlerta): void {
    this.reglaEditando.set(r);
    this.formAbierto.set(true);
  }
  cerrarForm(): void {
    this.formAbierto.set(false);
    this.reglaEditando.set(null);
  }

  onGuardar(regla: ReglaAlerta): void {
    // En modo ejemplo (sin backend) simulamos crear/editar localmente.
    if (this.usandoEjemplo()) {
      if (regla.reglaAlertaId === 0) {
        const nuevoId = Math.max(0, ...this.reglas().map(r => r.reglaAlertaId)) + 1;
        this.reglas.update(l => [...l, { ...regla, reglaAlertaId: nuevoId }]);
      } else {
        this.reglas.update(l => l.map(r => r.reglaAlertaId === regla.reglaAlertaId ? { ...r, ...regla } : r));
      }
      this.cerrarForm();
      this.mostrarAviso(regla.reglaAlertaId === 0 ? 'Regla creada (ejemplo).' : 'Regla actualizada (ejemplo).');
      return;
    }

    this.guardando.set(true);
    const peticion = regla.reglaAlertaId === 0
      ? this.reglaService.crear(regla)
      : this.reglaService.actualizar(regla);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarForm();
        this.mostrarAviso(regla.reglaAlertaId === 0 ? 'Regla creada.' : 'Regla actualizada.');
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set('No se pudo guardar la regla. ' + detalleError(err));
      }
    });
  }

  private mostrarAviso(texto: string): void {
    this.aviso.set(texto);
    setTimeout(() => this.aviso.set(null), 3000);
  }

  /** Reglas de ejemplo para ver la pantalla mientras el backend no responde. */
  private reglasEjemplo(): ReglaAlerta[] {
    return [
      { reglaAlertaId: 1, nombre: 'Helada crítica',  valorMin: 0,  valorMax: 2,   mensaje: 'Riesgo de helada',         activo: true,  tipoSensorId: 1, tipoFenomenoId: 4, nivelAlertaId: 4 },
      { reglaAlertaId: 2, nombre: 'Crecida de río',  valorMin: 3.8, valorMax: 4.5, mensaje: 'Nivel del río elevado',    activo: true,  tipoSensorId: 5, tipoFenomenoId: 1, nivelAlertaId: 3 },
      { reglaAlertaId: 3, nombre: 'Viento fuerte',   valorMin: 60, valorMax: 80,  mensaje: 'Tormenta con viento',      activo: true,  tipoSensorId: 3, tipoFenomenoId: 3, nivelAlertaId: 3 },
      { reglaAlertaId: 4, nombre: 'Lluvia intensa',  valorMin: 50, valorMax: 100, mensaje: 'Acumulación de lluvia',     activo: false, tipoSensorId: 4, tipoFenomenoId: 3, nivelAlertaId: 2 }
    ];
  }
}
