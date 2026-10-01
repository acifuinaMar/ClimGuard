import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Permiso } from '../core/roles';

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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  private auth = inject(AuthService);

  /** Controla si el menú lateral está visible (importante en móvil). */
  menuAbierto = signal(true);

  /** Datos de quien inició sesión, para el encabezado. */
  sesion = this.auth.sesion;

  nombre = computed(() => this.sesion()?.nombreMostrado ?? 'Invitado');
  /** Rol legible para mostrar en el encabezado (ej: "Usuario de consulta"). */
  rol = this.auth.rolEtiqueta;

  /** Iniciales para el círculo de color. */
  iniciales = computed(() =>
    this.nombre().split(' ').slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('')
  );

  /**
   * El menú se define como DATOS, no como HTML repetido.
   * Cada sección declara el PERMISO que necesita para aparecer. Así el menú
   * se arma solo según el rol, usando el mismo sistema de permisos que el
   * resto de la app (core/roles.ts). Si una sección no tiene `permiso`, la
   * ve cualquiera que haya iniciado sesión.
   */
  private todasLasSecciones: { ruta: string; icono: string; texto: string; permiso?: Permiso }[] = [
    { ruta: '/panel',       icono: '◉', texto: 'Panel',       permiso: 'dashboard.ver' },
    { ruta: '/sensores',    icono: '▤', texto: 'Sensores',    permiso: 'sensores.gestionar' },
    { ruta: '/umbrales',    icono: '⚙', texto: 'Reglas de alerta', permiso: 'reglas.gestionar' },
    { ruta: '/comunidades', icono: '◈', texto: 'Comunidades', permiso: 'comunidades.gestionar' },
    { ruta: '/usuarios',    icono: '◇', texto: 'Usuarios',    permiso: 'usuarios.gestionar' },
    { ruta: '/bitacora',    icono: '❑', texto: 'Bitácora',    permiso: 'bitacora.ver' }
  ];

  /**
   * El menú que se muestra: solo las secciones cuyo permiso tiene el usuario.
   * Un Operador no verá "Usuarios" ni "Bitácora"; un Usuario de consulta solo
   * verá el Panel.
   */
  secciones = computed(() =>
    this.todasLasSecciones.filter(s => !s.permiso || this.auth.puede(s.permiso))
  );

  alternarMenu() {
    this.menuAbierto.update(v => !v);
  }

  cerrarSesion() {
    this.auth.cerrarSesion();
  }
}
