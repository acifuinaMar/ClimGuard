import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Comunidad } from '../../core/models/comunidad.model';
import { ComunidadService } from '../../core/services/comunidad.service';
import { AuthService } from '../../core/services/auth.service';
import { ComunidadForm } from './comunidad-form';
import { SiPermisoDirective } from '../../shared/si-permiso.directive';
import { detalleError } from '../../core/http-error';

@Component({
  selector: 'app-comunidades-page',
  imports: [ComunidadForm, SiPermisoDirective],
  templateUrl: './comunidades-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './comunidades-page.scss'
})
export class ComunidadesPage {
  private servicio = inject(ComunidadService);
  private auth = inject(AuthService);

  comunidades = signal<Comunidad[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  /** true si el backend no respondió y mostramos comunidades de ejemplo. */
  usandoEjemplo = signal(false);

  formAbierto = signal(false);
  editando = signal<Comunidad | null>(null);
  guardando = signal(false);

  porBorrar = signal<Comunidad | null>(null);
  borrando = signal(false);

  aviso = signal<string | null>(null);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    // Si el backend no responde en 5s, caemos a datos de ejemplo para poder ver
    // la pantalla. Al conectarlo, usa las comunidades reales sin tocar nada.
    this.servicio.listar().pipe(
      timeout(5000),
      catchError(() => of<Comunidad[]>([]))
    ).subscribe((datos) => {
      if (datos.length === 0) {
        this.comunidades.set(this.comunidadesEjemplo());
        this.usandoEjemplo.set(true);
      } else {
        this.comunidades.set(datos);
        this.usandoEjemplo.set(false);
      }
      this.cargando.set(false);
    });
  }

  // ---- crear / editar ----
  nueva(): void { this.editando.set(null); this.formAbierto.set(true); }
  editar(c: Comunidad): void { this.editando.set(c); this.formAbierto.set(true); }
  cerrarForm(): void { this.formAbierto.set(false); this.editando.set(null); }

  onGuardar(c: Comunidad): void {
    this.guardando.set(true);
    const peticion = c.comunidadId === 0
      ? this.servicio.crear(c)
      : this.servicio.actualizar(c);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarForm();
        this.mostrarAviso(c.comunidadId === 0 ? 'Comunidad creada.' : 'Comunidad actualizada.');
        this.cargar();
      },
      error: (err) => {
        this.guardando.set(false);
        this.error.set('No se pudo guardar la comunidad. ' + detalleError(err));
      }
    });
  }

  // ---- borrar ----
  pedirBorrar(c: Comunidad): void { this.porBorrar.set(c); }
  cancelarBorrar(): void { this.porBorrar.set(null); }

  confirmarBorrar(): void {
    const c = this.porBorrar();
    if (!c) return;

    // El servicio ya toma de la sesión quién borra (para la bitácora).
    this.borrando.set(true);
    this.servicio.eliminar(c.comunidadId).subscribe({
      next: () => {
        this.borrando.set(false);
        this.porBorrar.set(null);
        this.mostrarAviso('Comunidad eliminada.');
        this.cargar();
      },
      error: (err) => {
        this.borrando.set(false);
        this.porBorrar.set(null);
        this.error.set('No se pudo eliminar la comunidad. ' + detalleError(err));
      }
    });
  }

  private mostrarAviso(texto: string): void {
    this.aviso.set(texto);
    setTimeout(() => this.aviso.set(null), 3000);
  }

  /** Comunidades de ejemplo para ver la pantalla mientras el backend no responde. */
  private comunidadesEjemplo(): Comunidad[] {
    return [
      { comunidadId: 1, nombreComunidad: 'Ciudad de Guatemala', descripcion: 'Área metropolitana', pais: 'Guatemala', departamento: 'Guatemala',     municipio: 'Guatemala',      latitud: 14.6349, longitud: -90.5069, activo: true },
      { comunidadId: 2, nombreComunidad: 'Quetzaltenango',      descripcion: 'Occidente',          pais: 'Guatemala', departamento: 'Quetzaltenango', municipio: 'Quetzaltenango', latitud: 14.8333, longitud: -91.5167, activo: true },
      { comunidadId: 3, nombreComunidad: 'Puerto Barrios',      descripcion: 'Zona Caribe',        pais: 'Guatemala', departamento: 'Izabal',         municipio: 'Puerto Barrios', latitud: 15.7278, longitud: -88.5944, activo: false }
    ];
  }
}
