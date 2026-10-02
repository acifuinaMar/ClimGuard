import { Component, computed, inject, signal } from '@angular/core';
import { Usuario } from '../../core/models/usuario.model';
import { UsuarioService } from '../../core/services/usuario.service';

@Component({
  selector: 'app-usuarios-page',
  templateUrl: './usuarios-page.html',
  styleUrl: './usuarios-page.scss'
})
export class UsuariosPage {
  private servicio = inject(UsuarioService);

  usuarios = signal<Usuario[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  activos = computed(() => this.usuarios().filter(u => u.activo).length);

  constructor() {
    this.servicio.listar().subscribe({
      next: (datos) => { this.usuarios.set(datos); this.cargando.set(false); },
      error: () => {
        this.error.set('No se pudieron cargar los usuarios.');
        this.cargando.set(false);
      }
    });
  }

  /**
   * Arma el nombre completo a partir de los cuatro campos que devuelve la API.
   * Se filtran los vacíos para no dejar espacios dobles cuando falta un apellido.
   */
  nombreCompleto(u: Usuario): string {
    const partes = [u.nombre1, u.nombre2, u.apellido1, u.apellido2]
      .map(p => (p ?? '').trim())
      .filter(p => p.length > 0);
    return partes.length ? partes.join(' ') : u.nombreUsuario;
  }

  /** Iniciales para el círculo de color. */
  iniciales(u: Usuario): string {
    return this.nombreCompleto(u).split(' ').slice(0, 2)
      .map(p => p.charAt(0).toUpperCase()).join('');
  }
}
