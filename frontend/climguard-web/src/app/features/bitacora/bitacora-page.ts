import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { BitacoraService, BitacoraVista } from '../../core/services/bitacora.service';

/** Un registro con su tipo de acción ya clasificado, para el color. */
interface RegistroVista extends BitacoraVista {
  tipo: 'crear' | 'editar' | 'borrar' | 'otro';
  fecha: string;
  hora: string;
  iniciales: string;
}

@Component({
  selector: 'app-bitacora-page',
  templateUrl: './bitacora-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './bitacora-page.scss'
})
export class BitacoraPage {
  private servicio = inject(BitacoraService);

  registros = signal<RegistroVista[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);
  usandoEjemplo = signal(false);

  total = computed(() => this.registros().length);

  constructor() {
    this.servicio.listar().subscribe({
      next: (datos) => {
        this.usandoEjemplo.set(datos.length === 0);
        const fuente = datos.length ? datos : this.ejemplo();
        this.registros.set(fuente.map(r => this.decorar(r)));
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la bitácora.');
        this.cargando.set(false);
      }
    });
  }

  /** Le agrega a cada registro su tipo de acción y la fecha ya formateada. */
  private decorar(r: BitacoraVista): RegistroVista {
    const accion = r.accion.toLowerCase();

    let tipo: RegistroVista['tipo'] = 'otro';
    if (accion.includes('registro') || accion.includes('crea') || accion.includes('nuevo')) {
      tipo = 'crear';
    } else if (accion.includes('actualiz') || accion.includes('modific') || accion.includes('edit')) {
      tipo = 'editar';
    } else if (accion.includes('elimin') || accion.includes('borr')) {
      tipo = 'borrar';
    }

    const d = new Date(r.fechaHora);
    const valida = !isNaN(d.getTime());

    return {
      ...r,
      tipo,
      fecha: valida ? d.toLocaleDateString() : (r.fechaHora ?? '').slice(0, 10),
      hora: valida ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      iniciales: r.nombreUsuario.slice(0, 2).toUpperCase()
    };
  }

  /** Registros de ejemplo para ver la pantalla mientras el backend no responde. */
  private ejemplo(): BitacoraVista[] {
    const h = (n: number) => new Date(Date.now() - n * 3600000).toISOString();
    return [
      { bitacoraId: 5, nombreEntidad: 'Sensor',      entidadId: 2, accion: 'Actualizar', descripcion: 'Actualización del sensor Río Dulce',     fechaHora: h(1),  usuarioId: 1, nombreUsuario: 'admin' },
      { bitacoraId: 4, nombreEntidad: 'Comunidad',   entidadId: 3, accion: 'Crear',      descripcion: 'Creación de comunidad Puerto Barrios',  fechaHora: h(3),  usuarioId: 1, nombreUsuario: 'admin' },
      { bitacoraId: 3, nombreEntidad: 'ReglaAlerta', entidadId: 1, accion: 'Actualizar', descripcion: 'Actualización de la regla Helada crítica', fechaHora: h(6),  usuarioId: 2, nombreUsuario: 'operador' },
      { bitacoraId: 2, nombreEntidad: 'Usuario',     entidadId: 2, accion: 'Crear',      descripcion: 'Creación del usuario operador',         fechaHora: h(26), usuarioId: 1, nombreUsuario: 'admin' },
      { bitacoraId: 1, nombreEntidad: 'Sensor',      entidadId: 9, accion: 'Eliminar',   descripcion: 'Eliminación del sensor de prueba',      fechaHora: h(30), usuarioId: 1, nombreUsuario: 'admin' }
    ];
  }
}
