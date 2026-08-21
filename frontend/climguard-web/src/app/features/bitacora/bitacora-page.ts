import { Component, computed, inject, signal } from '@angular/core';
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
  styleUrl: './bitacora-page.scss'
})
export class BitacoraPage {
  private servicio = inject(BitacoraService);

  registros = signal<RegistroVista[]>([]);
  cargando = signal(true);
  error = signal<string | null>(null);

  total = computed(() => this.registros().length);

  constructor() {
    this.servicio.listar().subscribe({
      next: (datos) => {
        this.registros.set(datos.map(r => this.decorar(r)));
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

    // Clasificamos por lo que dice la acción, para colorearla.
    let tipo: RegistroVista['tipo'] = 'otro';
    if (accion.includes('registro') || accion.includes('crea') || accion.includes('nuevo')) {
      tipo = 'crear';
    } else if (accion.includes('actualiz') || accion.includes('modific') || accion.includes('edit')) {
      tipo = 'editar';
    } else if (accion.includes('elimin') || accion.includes('borr')) {
      tipo = 'borrar';
    }

    // La fecha viene como "2026-08-21T03:23:32.343". La partimos en fecha y hora.
    const d = new Date(r.fechaRegistro);
    const valida = !isNaN(d.getTime());

    return {
      ...r,
      tipo,
      fecha: valida ? d.toLocaleDateString() : r.fechaRegistro.slice(0, 10),
      hora: valida ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      iniciales: r.nombreUsuario.slice(0, 2).toUpperCase()
    };
  }
}
