import { Component, inject, signal } from '@angular/core';
import { Comunidad } from '../../core/models/comunidad.model';
import { ComunidadService } from '../../core/services/comunidad.service';
import { AuthService } from '../../core/services/auth.service';
import { ComunidadForm } from './comunidad-form';

@Component({
  selector: 'app-comunidades-page',
  imports: [ComunidadForm],
  templateUrl: './comunidades-page.html',
  styleUrl: './comunidades-page.scss'
})
export class ComunidadesPage {
  private servicio = inject(ComunidadService);
  private auth = inject(AuthService);

  comunidades = signal<Comunidad[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

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
    this.servicio.listar().subscribe({
      next: (datos) => { this.comunidades.set(datos); this.cargando.set(false); },
      error: () => {
        this.error.set('No se pudieron cargar las comunidades.');
        this.cargando.set(false);
      }
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
      : this.servicio.actualizar(c.comunidadId, c);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarForm();
        this.mostrarAviso(c.comunidadId === 0 ? 'Comunidad creada.' : 'Comunidad actualizada.');
        this.cargar();
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('No se pudo guardar la comunidad.');
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
      error: () => {
        this.borrando.set(false);
        this.porBorrar.set(null);
        this.error.set('No se pudo eliminar la comunidad.');
      }
    });
  }

  private mostrarAviso(texto: string): void {
    this.aviso.set(texto);
    setTimeout(() => this.aviso.set(null), 3000);
  }
}
