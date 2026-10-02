import { Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { Permiso } from '../core/roles';

/**
 * Directiva estructural: muestra un elemento SOLO si el usuario tiene el permiso.
 *
 * Uso en el HTML:
 *   <button *siPermiso="'usuarios.gestionar'">Nuevo usuario</button>
 *
 * Así, un Operador o un Usuario de consulta simplemente NO verán ese botón.
 * Es la misma lógica que el guardián de rutas (auth.puede), pero aplicada a
 * pedacitos de la interfaz — una sola fuente de verdad para toda la app.
 *
 * ⚠️ Recordatorio para la defensa: esto es comodidad visual, NO seguridad.
 * La seguridad real la impone la API, que rechaza con 403 si el rol no tiene
 * permiso. La directiva solo evita mostrar botones que no sirven.
 */
@Directive({
  selector: '[siPermiso]'
})
export class SiPermisoDirective {
  private auth = inject(AuthService);
  private tpl = inject(TemplateRef<unknown>);
  private vista = inject(ViewContainerRef);

  /** El permiso requerido, pasado desde el HTML. */
  siPermiso = input.required<Permiso>();

  private visible = false;

  constructor() {
    // effect() se vuelve a ejecutar si cambia la sesión (ej: cambia de rol).
    effect(() => {
      const permitido = this.auth.puede(this.siPermiso());

      if (permitido && !this.visible) {
        this.vista.createEmbeddedView(this.tpl);
        this.visible = true;
      } else if (!permitido && this.visible) {
        this.vista.clear();
        this.visible = false;
      }
    });
  }
}
