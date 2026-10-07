import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { Alerta } from '../../core/models/alerta.model';
import { Comunidad } from '../../core/models/comunidad.model';
import { NivelAlertaCat, TipoFenomenoCat } from '../../core/models/catalogo.model';
import { AlertaService } from '../../core/services/alerta.service';
import { ComunidadService } from '../../core/services/comunidad.service';
import { CatalogoService } from '../../core/services/catalogo.service';
import { SiPermisoDirective } from '../../shared/si-permiso.directive';

/* ============================================================
   ALERTAS (Fase 2, gestión de alertas)
   ------------------------------------------------------------
   Muestra las alertas ACTIVAS y permite "atenderlas": marcarlas como revisadas
   y dejar constancia de quién lo hizo (Operador o Administrador).
   Lee /api/Alerta y los catálogos; si el backend no responde, usa ejemplos.
   ============================================================ */
@Component({
  selector: 'app-alertas-page',
  imports: [DatePipe, SiPermisoDirective],
  templateUrl: './alertas-page.html',
  styleUrl: './alertas-page.scss',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class AlertasPage {
  private alertaService = inject(AlertaService);
  private comunidadService = inject(ComunidadService);
  private catalogo = inject(CatalogoService);

  alertas = signal<Alerta[]>([]);
  private niveles = signal<NivelAlertaCat[]>([]);
  private fenomenos = signal<TipoFenomenoCat[]>([]);
  private comunidades = signal<Comunidad[]>([]);

  cargando = signal(true);
  error = signal<string | null>(null);
  usandoEjemplo = signal(false);
  atendiendoId = signal<number | null>(null);
  aviso = signal<string | null>(null);

  /** Solo las alertas activas: las que hay que atender. */
  activas = computed(() => this.alertas().filter(a => a.activo));

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      alertas: this.alertaService.listar().pipe(timeout(5000), catchError(() => of<Alerta[]>([]))),
      niveles: this.catalogo.nivelesAlerta(),
      fenomenos: this.catalogo.tiposFenomeno(),
      comunidades: this.comunidadService.listar().pipe(timeout(5000), catchError(() => of<Comunidad[]>([])))
    }).subscribe(({ alertas, niveles, fenomenos, comunidades }) => {
      this.niveles.set(niveles);
      this.fenomenos.set(fenomenos);
      this.comunidades.set(comunidades.length ? comunidades : this.comunidadesEjemplo());

      if (alertas.length === 0) {
        this.alertas.set(this.alertasEjemplo());
        this.usandoEjemplo.set(true);
      } else {
        this.alertas.set(alertas);
        this.usandoEjemplo.set(false);
      }
      this.cargando.set(false);
    });
  }

  nombreNivel(id: number): string {
    return this.niveles().find(n => n.nivelAlertaId === id)?.nombre ?? `Nivel ${id}`;
  }
  colorNivel(id: number): string {
    return this.niveles().find(n => n.nivelAlertaId === id)?.colorHex ?? '#94a3b8';
  }
  nombreFenomeno(id: number): string {
    return this.fenomenos().find(f => f.tipoFenomenoId === id)?.nombre ?? `Fenómeno ${id}`;
  }
  nombreComunidad(id: number): string {
    return this.comunidades().find(c => c.comunidadId === id)?.nombreComunidad ?? `Comunidad #${id}`;
  }

  atender(a: Alerta): void {
    // En modo ejemplo no hay backend: simulamos atenderla localmente.
    if (this.usandoEjemplo()) {
      this.alertas.update(lista =>
        lista.map(x => x.alertaId === a.alertaId ? { ...x, activo: false } : x)
      );
      this.mostrarAviso('Alerta atendida (ejemplo).');
      return;
    }

    this.atendiendoId.set(a.alertaId);
    this.alertaService.atender(a).subscribe({
      next: () => {
        this.atendiendoId.set(null);
        this.mostrarAviso('Alerta atendida.');
        this.cargar();
      },
      error: () => {
        this.atendiendoId.set(null);
        this.error.set('No se pudo atender la alerta. ¿Está encendido el backend?');
      }
    });
  }

  private mostrarAviso(texto: string): void {
    this.aviso.set(texto);
    setTimeout(() => this.aviso.set(null), 3000);
  }

  private alertasEjemplo(): Alerta[] {
    const ahora = new Date().toISOString();
    return [
      { alertaId: 1, valorDetectado: -1,  mensajeSnap: 'Riesgo de helada',      nivelAlertaIdSnap: 4, tipoFenomenoIdSnap: 4, fechaHora: ahora, activo: true, sensorId: 2, comunidadId: 2, reglaAlertaId: 1, estadoAlertaId: 1, usuarioResponsableId: null },
      { alertaId: 2, valorDetectado: 3.9, mensajeSnap: 'Nivel del río elevado', nivelAlertaIdSnap: 3, tipoFenomenoIdSnap: 1, fechaHora: ahora, activo: true, sensorId: 3, comunidadId: 3, reglaAlertaId: 2, estadoAlertaId: 1, usuarioResponsableId: null }
    ];
  }

  private comunidadesEjemplo(): Comunidad[] {
    return [
      { comunidadId: 1, nombreComunidad: 'Ciudad de Guatemala', descripcion: null, pais: 'Guatemala', departamento: 'Guatemala',     municipio: 'Guatemala',      latitud: 14.6349, longitud: -90.5069, activo: true },
      { comunidadId: 2, nombreComunidad: 'Quetzaltenango',      descripcion: null, pais: 'Guatemala', departamento: 'Quetzaltenango', municipio: 'Quetzaltenango', latitud: 14.8333, longitud: -91.5167, activo: true },
      { comunidadId: 3, nombreComunidad: 'Puerto Barrios',      descripcion: null, pais: 'Guatemala', departamento: 'Izabal',         municipio: 'Puerto Barrios', latitud: 15.7278, longitud: -88.5944, activo: true }
    ];
  }
}
