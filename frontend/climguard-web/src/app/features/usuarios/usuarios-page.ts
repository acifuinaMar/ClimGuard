import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { Usuario, ROLES } from '../../core/models/usuario.model';
import { UsuarioService } from '../../core/services/usuario.service';

@Component({
  selector: 'app-usuarios-page',
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

  /** Nombre a mostrar: el nombre completo del backend, o el usuario si viene vacío. */
  nombreCompleto(u: Usuario): string {
    return (u.nombreCompleto ?? '').trim() || u.nombreUsuario;
  }

  /** Iniciales para el círculo de color. */
  iniciales(u: Usuario): string {
    return this.nombreCompleto(u).split(' ').slice(0, 2)
      .map(p => p.charAt(0).toUpperCase()).join('');
  }

  /** Nombre del rol a partir de su id (1 Administrador, 2 Operador, 3 Consulta). */
  nombreRol(rolId: number): string {
    return ROLES.find(r => r.rolId === rolId)?.nombre ?? `Rol ${rolId}`;
  }

  esAdmin(u: Usuario): boolean {
    return u.rolId === 1;
  }

  private ejemplo(): Usuario[] {
    return [
      { usuarioId: 1, nombreCompleto: 'Administrador del Sistema', nombreUsuario: 'admin',    ultimoAcceso: null, activo: true,  rolId: 1 },
      { usuarioId: 2, nombreCompleto: 'Operador de Campo',         nombreUsuario: 'operador', ultimoAcceso: null, activo: true,  rolId: 2 },
      { usuarioId: 3, nombreCompleto: 'Usuario de Consulta',       nombreUsuario: 'consulta', ultimoAcceso: null, activo: false, rolId: 3 }
    ];
  }
}
