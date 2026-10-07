import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Usuario, GuardarUsuario, ROLES } from '../../core/models/usuario.model';
import { UsuarioService } from '../../core/services/usuario.service';
import { UsuarioForm } from './usuario-form';

@Component({
  selector: 'app-usuarios-page',
  imports: [UsuarioForm],
  templateUrl: './usuarios-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './usuarios-page.scss'
})
export class UsuariosPage {
  private servicio = inject(UsuarioService);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  usandoEjemplo = signal(false);

  formAbierto = signal(false);
  editando = signal<Usuario | null>(null);
  guardando = signal(false);
  aviso = signal<string | null>(null);

  activos = computed(() => this.usuarios().filter(u => u.activo).length);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.servicio.listar().pipe(
      timeout(5000),
      catchError(() => of<Usuario[]>([]))
    ).subscribe((datos) => {
      this.usandoEjemplo.set(datos.length === 0);
      this.usuarios.set(datos.length ? datos : this.ejemplo());
      this.cargando.set(false);
    });
  }

  nombreCompleto(u: Usuario): string {
    return (u.nombreCompleto ?? '').trim() || u.nombreUsuario;
  }
  iniciales(u: Usuario): string {
    return this.nombreCompleto(u).split(' ').slice(0, 2)
      .map(p => p.charAt(0).toUpperCase()).join('');
  }
  nombreRol(rolId: number): string {
    return ROLES.find(r => r.rolId === rolId)?.nombre ?? `Rol ${rolId}`;
  }
  esAdmin(u: Usuario): boolean {
    return u.rolId === 1;
  }

  // ---- crear / editar ----
  nuevo(): void { this.editando.set(null); this.formAbierto.set(true); }
  editar(u: Usuario): void { this.editando.set(u); this.formAbierto.set(true); }
  cerrarForm(): void { this.formAbierto.set(false); this.editando.set(null); }

  onGuardar(g: GuardarUsuario): void {
    // En modo ejemplo no hay backend: simulamos localmente.
    if (this.usandoEjemplo()) {
      if (g.usuarioId === 0) {
        const nuevoId = Math.max(0, ...this.usuarios().map(u => u.usuarioId)) + 1;
        this.usuarios.update(l => [...l, {
          usuarioId: nuevoId, nombreCompleto: g.nombreCompleto, nombreUsuario: g.nombreUsuario,
          ultimoAcceso: null, activo: g.activo, rolId: g.rolId
        }]);
      } else {
        this.usuarios.update(l => l.map(u => u.usuarioId === g.usuarioId
          ? { ...u, nombreCompleto: g.nombreCompleto, nombreUsuario: g.nombreUsuario, activo: g.activo, rolId: g.rolId }
          : u));
      }
      this.cerrarForm();
      this.mostrarAviso(g.usuarioId === 0 ? 'Usuario creado (ejemplo).' : 'Usuario actualizado (ejemplo).');
      return;
    }

    this.guardando.set(true);
    const peticion = g.usuarioId === 0 ? this.servicio.crear(g) : this.servicio.actualizar(g);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarForm();
        this.mostrarAviso(g.usuarioId === 0 ? 'Usuario creado.' : 'Usuario actualizado.');
        this.cargar();
      },
      error: () => {
        this.guardando.set(false);
        this.error.set('No se pudo guardar el usuario. ¿Está encendido el backend?');
      }
    });
  }

  private mostrarAviso(texto: string): void {
    this.aviso.set(texto);
    setTimeout(() => this.aviso.set(null), 3000);
  }

  private ejemplo(): Usuario[] {
    return [
      { usuarioId: 1, nombreCompleto: 'Administrador del Sistema', nombreUsuario: 'admin',    ultimoAcceso: null, activo: true,  rolId: 1 },
      { usuarioId: 2, nombreCompleto: 'Operador de Campo',         nombreUsuario: 'operador', ultimoAcceso: null, activo: true,  rolId: 2 },
      { usuarioId: 3, nombreCompleto: 'Usuario de Consulta',       nombreUsuario: 'consulta', ultimoAcceso: null, activo: false, rolId: 3 }
    ];
  }
}
