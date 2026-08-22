import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Bitacora } from '../models/bitacora.model';
import { Usuario } from '../models/usuario.model';

/** Un registro de bitácora con el nombre del usuario ya resuelto. */
export interface BitacoraVista extends Bitacora {
  nombreUsuario: string;
}

/**
 * Trato con /api/Bitacora.
 *
 * La API devuelve solo el usuarioId (un número). Para mostrar algo legible,
 * este servicio cruza cada registro con la lista de usuarios y le pega el
 * nombre. Así la tabla dice "admin" en vez de "1".
 */
@Injectable({ providedIn: 'root' })
export class BitacoraService {
  private http = inject(HttpClient);

  private get suf(): string { return environment.sufijoArchivo; }

  /**
   * Trae la bitácora y los usuarios A LA VEZ (forkJoin), y los combina.
   * forkJoin espera a que ambas llamadas terminen antes de continuar.
   */
  listar(): Observable<BitacoraVista[]> {
    const bitacora$ = this.http.get<Bitacora[]>(`${environment.apiUrl}/Bitacora${this.suf}`);
    const usuarios$ = this.http.get<Usuario[]>(`${environment.apiUrl}/Usuario${this.suf}`);

    return forkJoin([bitacora$, usuarios$]).pipe(
      map(([registros, usuarios]) => {
        // Un mapa id -> nombre, para buscar rápido.
        const nombrePorId = new Map(usuarios.map(u => [u.usuarioId, u.nombreUsuario]));

        return registros
          .map(r => ({
            ...r,
            nombreUsuario: nombrePorId.get(r.usuarioId) ?? `Usuario ${r.usuarioId}`
          }))
          // Más recientes primero.
          .sort((a, b) => b.bitacoraId - a.bitacoraId);
      })
    );
  }
}
