import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { TipoFenomeno } from '../../core/models/tipo-fenomeno.model';
import { TipoFenomenoService } from '../../core/services/tipo-fenomeno.service';
import { FenomenoForm } from './fenomeno-form';
import { detalleError } from '../../core/http-error';

/* ============================================================
   TIPOS DE FENÓMENO (catálogo de Fase 2)
   ------------------------------------------------------------
   Catálogo de fenómenos climáticos (Inundación, Sequía, Tormenta…). Lo usan las
   reglas de alerta y el historial. CRUD completo para Operador y Administrador.
   Si el backend no responde, muestra datos de ejemplo y simula las acciones.
   ============================================================ */
@Component({
  selector: 'app-fenomenos-page',
  imports: [FenomenoForm],
  templateUrl: './fenomenos-page.html',
  styleUrl: './fenomenos-page.scss',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class FenomenosPage {
  private servicio = inject(TipoFenomenoService);

  tipos = signal<TipoFenomeno[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  usandoEjemplo = signal(false);

  formAbierto = signal(false);
  editando = signal<TipoFenomeno | null>(null);
  guardando = signal(false);

  porBorrar = signal<TipoFenomeno | null>(null);
  borrando = signal(false);

  aviso = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.servicio.listar().pipe(
      timeout(5000),
      catchError(() => of<TipoFenomeno[]>([]))
    ).subscribe((datos) => {
      if (datos.length === 0) {
        this.tipos.set(this.ejemplo());
        this.usandoEjemplo.set(true);
      } else {
        this.tipos.set(datos);
        this.usandoEjemplo.set(false);
      }
      this.cargando.set(false);
    });
  }

  // ---- crear / editar ----
  nuevo(): void { this.editando.set(null); this.formAbierto.set(true); }
  editar(t: TipoFenomeno): void { this.editando.set(t); this.formAbierto.set(true); }
  cerrarForm(): void { this.formAbierto.set(false); this.editando.set(null); }

  onGuardar(t: TipoFenomeno): void {
    // En modo ejemplo no hay backend: simulamos localmente.
    if (this.usandoEjemplo()) {
      if (t.tipoFenomenoId === 0) {
        const nuevoId = Math.max(0, ...this.tipos().map(x => x.tipoFenomenoId)) + 1;
        this.tipos.update(l => [...l, { ...t, tipoFenomenoId: nuevoId }]);
      } else {
        this.tipos.update(l => l.map(x => x.tipoFenomenoId === t.tipoFenomenoId ? { ...x, ...t } : x));
      }
      this.cerrarForm();
      this.mostrarAviso(t.tipoFenomenoId === 0 ? 'Tipo creado (ejemplo).' : 'Tipo actualizado (ejemplo).');
      return;
    }

    this.guardando.set(true);
    const peticion = t.tipoFenomenoId === 0 ? this.servicio.crear(t) : this.servicio.actualizar(t);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarForm();
        this.mostrarAviso(t.tipoFenomenoId === 0 ? 'Tipo creado.' : 'Tipo actualizado.');
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set('No se pudo guardar. ' + detalleError(err));
      }
    });
  }

  // ---- borrar ----
  pedirBorrar(t: TipoFenomeno): void { this.porBorrar.set(t); }
  cancelarBorrar(): void { this.porBorrar.set(null); }

  confirmarBorrar(): void {
    const t = this.porBorrar();
    if (!t) return;

    if (this.usandoEjemplo()) {
      this.tipos.update(l => l.filter(x => x.tipoFenomenoId !== t.tipoFenomenoId));
      this.porBorrar.set(null);
      this.mostrarAviso('Tipo eliminado (ejemplo).');
      return;
    }

    this.borrando.set(true);
    this.servicio.eliminar(t.tipoFenomenoId).subscribe({
      next: () => {
        this.borrando.set(false);
        this.porBorrar.set(null);
        this.mostrarAviso('Tipo eliminado.');
        this.cargar();
      },
      error: (err) => {
        this.borrando.set(false);
        this.porBorrar.set(null);
        this.error.set('No se pudo eliminar. ' + detalleError(err));
      }
    });
  }

  private mostrarAviso(texto: string): void {
    this.aviso.set(texto);
    setTimeout(() => this.aviso.set(null), 3000);
  }

  private ejemplo(): TipoFenomeno[] {
    return [
      { tipoFenomenoId: 1, nombre: 'Inundación',        activo: true },
      { tipoFenomenoId: 2, nombre: 'Sequía',            activo: true },
      { tipoFenomenoId: 3, nombre: 'Tormenta',          activo: true },
      { tipoFenomenoId: 4, nombre: 'Helada',            activo: true },
      { tipoFenomenoId: 5, nombre: 'Incendio forestal', activo: false }
    ];
  }
}
