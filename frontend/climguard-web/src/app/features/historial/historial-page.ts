import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { Alerta } from '../../core/models/alerta.model';
import { Comunidad } from '../../core/models/comunidad.model';
import { NivelAlertaCat, TipoFenomenoCat } from '../../core/models/catalogo.model';
import { AlertaService } from '../../core/services/alerta.service';
import { ComunidadService } from '../../core/services/comunidad.service';
import { CatalogoService } from '../../core/services/catalogo.service';

/* ============================================================
   HISTORIAL DE EVENTOS (Fase 2, RF-ADM-44 a 48)
   ------------------------------------------------------------
   Cada alerta es un "evento de riesgo detectado". Aquí se consultan TODOS
   (activos y atendidos), con filtros por fecha, comunidad, fenómeno y nivel,
   y un resumen con estadísticas. Es solo lectura.
   ============================================================ */
@Component({
  selector: 'app-historial-page',
  imports: [DatePipe, FormsModule],
  templateUrl: './historial-page.html',
  styleUrl: './historial-page.scss',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class HistorialPage {
  private alertaService = inject(AlertaService);
  private comunidadService = inject(ComunidadService);
  private catalogo = inject(CatalogoService);

  private alertas = signal<Alerta[]>([]);
  niveles = signal<NivelAlertaCat[]>([]);
  fenomenos = signal<TipoFenomenoCat[]>([]);
  comunidades = signal<Comunidad[]>([]);

  cargando = signal(true);
  error = signal<string | null>(null);
  usandoEjemplo = signal(false);

  // ---- Filtros (RF-ADM-47) ----
  filtroFecha = signal('');
  filtroComunidad = signal(0);
  filtroFenomeno = signal(0);
  filtroNivel = signal(0);

  /** Los eventos que pasan los filtros, del más reciente al más antiguo. */
  filtradas = computed(() => {
    const f = this.filtroFecha();
    const com = Number(this.filtroComunidad());
    const fen = Number(this.filtroFenomeno());
    const niv = Number(this.filtroNivel());

    return this.alertas()
      .filter(a =>
        (!f || a.fechaHora.slice(0, 10) === f) &&
        (!com || a.comunidadId === com) &&
        (!fen || a.tipoFenomenoIdSnap === fen) &&
        (!niv || a.nivelAlertaIdSnap === niv)
      )
      .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime());
  });

  /** Estadísticas sobre lo filtrado (RF-ADM-48). */
  stats = computed(() => {
    const todas = this.filtradas();
    return {
      total: todas.length,
      activas: todas.filter(a => a.activo).length,
      atendidas: todas.filter(a => !a.activo).length
    };
  });

  hayFiltros = computed(() =>
    !!this.filtroFecha() || !!Number(this.filtroComunidad()) ||
    !!Number(this.filtroFenomeno()) || !!Number(this.filtroNivel())
  );

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
        this.alertas.set(this.eventosEjemplo());
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

  limpiarFiltros(): void {
    this.filtroFecha.set('');
    this.filtroComunidad.set(0);
    this.filtroFenomeno.set(0);
    this.filtroNivel.set(0);
  }

  private eventosEjemplo(): Alerta[] {
    const dia = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
    return [
      { alertaId: 1, valorDetectado: -1,  mensajeSnap: 'Riesgo de helada',      nivelAlertaIdSnap: 4, tipoFenomenoIdSnap: 4, fechaHora: dia(0), activo: true,  sensorId: 2, comunidadId: 2, reglaAlertaId: 1, estadoAlertaId: 1, usuarioResponsableId: null },
      { alertaId: 2, valorDetectado: 3.9, mensajeSnap: 'Nivel del río elevado', nivelAlertaIdSnap: 3, tipoFenomenoIdSnap: 1, fechaHora: dia(0), activo: true,  sensorId: 3, comunidadId: 3, reglaAlertaId: 2, estadoAlertaId: 1, usuarioResponsableId: null },
      { alertaId: 3, valorDetectado: 72,  mensajeSnap: 'Tormenta con viento',   nivelAlertaIdSnap: 3, tipoFenomenoIdSnap: 3, fechaHora: dia(1), activo: false, sensorId: 1, comunidadId: 1, reglaAlertaId: 3, estadoAlertaId: 2, usuarioResponsableId: 1 },
      { alertaId: 4, valorDetectado: 65,  mensajeSnap: 'Lluvia intensa',        nivelAlertaIdSnap: 2, tipoFenomenoIdSnap: 3, fechaHora: dia(2), activo: false, sensorId: 4, comunidadId: 4, reglaAlertaId: 4, estadoAlertaId: 2, usuarioResponsableId: 1 },
      { alertaId: 5, valorDetectado: 1,   mensajeSnap: 'Temperatura muy baja',  nivelAlertaIdSnap: 3, tipoFenomenoIdSnap: 4, fechaHora: dia(3), activo: false, sensorId: 2, comunidadId: 2, reglaAlertaId: 1, estadoAlertaId: 2, usuarioResponsableId: 1 }
    ];
  }

  private comunidadesEjemplo(): Comunidad[] {
    return [
      { comunidadId: 1, nombreComunidad: 'Ciudad de Guatemala', descripcion: null, pais: 'Guatemala', departamento: 'Guatemala',     municipio: 'Guatemala',      latitud: 14.6349, longitud: -90.5069, activo: true },
      { comunidadId: 2, nombreComunidad: 'Quetzaltenango',      descripcion: null, pais: 'Guatemala', departamento: 'Quetzaltenango', municipio: 'Quetzaltenango', latitud: 14.8333, longitud: -91.5167, activo: true },
      { comunidadId: 3, nombreComunidad: 'Puerto Barrios',      descripcion: null, pais: 'Guatemala', departamento: 'Izabal',         municipio: 'Puerto Barrios', latitud: 15.7278, longitud: -88.5944, activo: true },
      { comunidadId: 4, nombreComunidad: 'Cobán',               descripcion: null, pais: 'Guatemala', departamento: 'Alta Verapaz',   municipio: 'Cobán',          latitud: 15.4708, longitud: -90.3711, activo: true }
    ];
  }
}
