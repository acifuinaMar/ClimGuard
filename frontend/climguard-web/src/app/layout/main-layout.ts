import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

/**
 * El MARCO de la aplicación: encabezado arriba, menú a la izquierda,
 * y un hueco en el centro donde se pinta cada pantalla.
 *
 * Se dibuja UNA sola vez. Al navegar entre secciones, el encabezado y el
 * menú no se vuelven a construir — solo cambia el contenido del centro.
 * Por eso el menú no parpadea al cambiar de sección.
 */
@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  private auth = inject(AuthService);

  /** Controla si el menú lateral está visible (importante en móvil). */
  menuAbierto = signal(true);

  /** Datos de quien inició sesión, para el encabezado. */
  sesion = this.auth.sesion;

  nombre = computed(() => this.sesion()?.nombreMostrado ?? 'Invitado');
  rol = computed(() => this.sesion()?.rol ?? '');

  /** Iniciales para el círculo de color. */
  iniciales = computed(() =>
    this.nombre().split(' ').slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('')
  );

  /**
   * El menú se define como DATOS, no como HTML repetido.
   * Agregar una sección nueva es añadir una línea a este arreglo,
   * no copiar y pegar otro bloque de <a> en la plantilla.
   */
  secciones = [
    { ruta: '/panel',    icono: '◉', texto: 'Panel' },
    { ruta: '/sensores',    icono: '▤', texto: 'Sensores' },
    { ruta: '/comunidades', icono: '◈', texto: 'Comunidades' },
    { ruta: '/usuarios', icono: '◇', texto: 'Usuarios' }
  ];

  alternarMenu() {
    this.menuAbierto.update(v => !v);
  }

  cerrarSesion() {
    this.auth.cerrarSesion();
  }
}
