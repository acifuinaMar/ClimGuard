import {
  Component, ElementRef, inject, viewChild, afterNextRender,
  signal, ChangeDetectionStrategy, OnDestroy
} from '@angular/core';
import * as L from 'leaflet';
import { forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

import { ComunidadService } from '../../core/services/comunidad.service';
import { SensorService } from '../../core/services/sensor.service';
import { Comunidad } from '../../core/models/comunidad.model';
import { Sensor } from '../../core/models/sensor.model';
import { calcularNivel, textoNivel, unidadDe, Nivel } from '../../core/nivel-alerta';

/* ============================================================
   MAPA DE MONITOREO — propuesta de valor (no lo pide el enunciado)
   ------------------------------------------------------------
   Para un sistema de alerta TEMPRANA, ver las comunidades en un mapa real,
   pintadas por su nivel de peligro, dice de un vistazo DÓNDE está el problema.
   Mucho más claro que una tabla de números.

   - Usa Leaflet + OpenStreetMap (gratis, sin llave de API).
   - Cada comunidad es un punto, coloreado por el PEOR de sus sensores.
   - Lee los MISMOS endpoints que el resto de la app (Comunidad y Sensor).
     Cuando el backend no está, muestra datos de ejemplo para poder verlo;
     en cuanto el backend responda, usa los datos reales sin tocar nada.
   ============================================================ */
@Component({
  selector: 'app-mapa-page',
  templateUrl: './mapa-page.html',
  styleUrl: './mapa-page.scss',
  changeDetection: ChangeDetectionStrategy.Eager
})
export class MapaPage implements OnDestroy {
  private comunidadService = inject(ComunidadService);
  private sensorService = inject(SensorService);

  /** El <div> donde Leaflet dibuja el mapa. */
  private contenedor = viewChild.required<ElementRef<HTMLDivElement>>('mapa');

  cargando = signal(true);
  /** true si el backend no dio datos y estamos mostrando el ejemplo. */
  usandoEjemplo = signal(false);

  private mapa?: L.Map;
  private capa = L.layerGroup();

  constructor() {
    // afterNextRender corre cuando el <div> ya existe en el navegador.
    afterNextRender(() => this.iniciar());
  }

  private iniciar(): void {
    this.mapa = L.map(this.contenedor().nativeElement).setView([15.6, -90.3], 7); // Guatemala

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 18
    }).addTo(this.mapa);

    this.capa.addTo(this.mapa);
    this.cargarDatos();
  }

  private cargarDatos(): void {
    // Pedimos comunidades y sensores a la vez. Si alguna falla (backend caído),
    // devolvemos lista vacía en vez de romper.
    // timeout(5000): si el backend no responde en 5s (p. ej. está caído), no
    // dejamos el mapa colgado — caemos al ejemplo. También protege en producción.
    forkJoin({
      comunidades: this.comunidadService.listar().pipe(timeout(5000), catchError(() => of<Comunidad[]>([]))),
      sensores: this.sensorService.listar().pipe(timeout(5000), catchError(() => of<Sensor[]>([])))
    }).subscribe(({ comunidades, sensores }) => {
      let coms = comunidades;
      let sens = sensores;

      if (coms.length === 0) {
        const ej = this.datosEjemplo();
        coms = ej.comunidades;
        sens = ej.sensores;
        this.usandoEjemplo.set(true);
      }

      this.pintar(coms, sens);
      this.cargando.set(false);
    });
  }

  private pintar(comunidades: Comunidad[], sensores: Sensor[]): void {
    this.capa.clearLayers();
    const puntos: L.LatLngExpression[] = [];

    for (const c of comunidades) {
      const suyos = sensores.filter(s => s.comunidadId === c.comunidadId);
      const nivel = this.nivelComunidad(suyos);

      L.marker([c.latitud, c.longitud], { icon: this.icono(nivel) })
        .bindPopup(this.popup(c, suyos))
        .addTo(this.capa);

      puntos.push([c.latitud, c.longitud]);
    }

    // Ajusta el zoom para que se vean todas las comunidades.
    if (puntos.length && this.mapa) {
      this.mapa.fitBounds(L.latLngBounds(puntos), { padding: [40, 40], maxZoom: 9 });
    }
  }

  /** El nivel de una comunidad es el PEOR de sus sensores. */
  private nivelComunidad(sensores: Sensor[]): Nivel {
    const orden: Nivel[] = ['rojo', 'naranja', 'amarillo', 'verde'];
    let peor: Nivel = 'verde';
    for (const s of sensores) {
      const n = calcularNivel(s.tipoSensorId, s.valorActual);
      if (orden.indexOf(n) < orden.indexOf(peor)) peor = n;
    }
    return peor;
  }

  private color(n: Nivel): string {
    return { verde: '#22c55e', amarillo: '#eab308', naranja: '#f97316', rojo: '#dc2626' }[n];
  }

  /** Un punto de color como marcador (evita el problema de los iconos de Leaflet). */
  private icono(n: Nivel): L.DivIcon {
    return L.divIcon({
      className: 'marcador',
      html: `<span class="marcador__punto" style="background:${this.color(n)}"></span>`,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -11]
    });
  }

  private popup(c: Comunidad, sensores: Sensor[]): string {
    const filas = sensores.length
      ? sensores.map(s => {
          const n = calcularNivel(s.tipoSensorId, s.valorActual);
          return `<li><span class="pop__punto" style="background:${this.color(n)}"></span>
                  ${s.nombre}: <strong>${s.valorActual} ${unidadDe(s.tipoSensorId)}</strong>
                  <em>(${textoNivel(n)})</em></li>`;
        }).join('')
      : '<li>Sin sensores</li>';
    return `<div class="pop"><h4>${c.nombreComunidad}</h4><ul>${filas}</ul></div>`;
  }

  /** Datos de ejemplo (Guatemala) para ver el mapa mientras el backend no está. */
  private datosEjemplo(): { comunidades: Comunidad[]; sensores: Sensor[] } {
    const ahora = new Date().toISOString();
    const comunidades: Comunidad[] = [
      { comunidadId: 1, nombreComunidad: 'Ciudad de Guatemala', descripcion: 'Área metropolitana', pais: 'Guatemala', departamento: 'Guatemala',     municipio: 'Guatemala',      latitud: 14.6349, longitud: -90.5069, activo: true },
      { comunidadId: 2, nombreComunidad: 'Quetzaltenango',      descripcion: 'Occidente',          pais: 'Guatemala', departamento: 'Quetzaltenango', municipio: 'Quetzaltenango', latitud: 14.8333, longitud: -91.5167, activo: true },
      { comunidadId: 3, nombreComunidad: 'Puerto Barrios',      descripcion: 'Caribe',             pais: 'Guatemala', departamento: 'Izabal',         municipio: 'Puerto Barrios', latitud: 15.7278, longitud: -88.5944, activo: true },
      { comunidadId: 4, nombreComunidad: 'Cobán',               descripcion: 'Verapaz',            pais: 'Guatemala', departamento: 'Alta Verapaz',   municipio: 'Cobán',          latitud: 15.4708, longitud: -90.3711, activo: true }
    ];
    const sensores: Sensor[] = [
      { sensorId: 1, comunidadId: 1, tipoSensorId: 3, nombre: 'Viento Centro',  valorActual: 25,  activo: true, fechaInstalacion: ahora, ultimaActualizacion: ahora, usuarioLogeado: 0 }, // verde
      { sensorId: 2, comunidadId: 2, tipoSensorId: 1, nombre: 'Temp. Xela',     valorActual: -1,  activo: true, fechaInstalacion: ahora, ultimaActualizacion: ahora, usuarioLogeado: 0 }, // rojo (helada)
      { sensorId: 3, comunidadId: 3, tipoSensorId: 5, nombre: 'Río Dulce',      valorActual: 3.9, activo: true, fechaInstalacion: ahora, ultimaActualizacion: ahora, usuarioLogeado: 0 }, // naranja
      { sensorId: 4, comunidadId: 4, tipoSensorId: 4, nombre: 'Lluvia Cobán',   valorActual: 25,  activo: true, fechaInstalacion: ahora, ultimaActualizacion: ahora, usuarioLogeado: 0 }  // amarillo
    ];
    return { comunidades, sensores };
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
  }
}
