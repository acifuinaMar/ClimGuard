import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, of, Observable } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
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
 * nombre. Si el backend no responde, devuelve lista vacía (no rompe) y la
 * pantalla muestra datos de ejemplo.
 */
@Injectable({ providedIn: 'root' })
export class BitacoraService {
  private http = inject(HttpClient);

  private get suf(): string { return environment.sufijoArchivo; }

  listar(): Observable<BitacoraVista[]> {
    const bitacora$ = this.http.get<Bitacora[]>(`${environment.apiUrl}/Bitacora${this.suf}`)
      .pipe(timeout(5000), catchError(() => of<Bitacora[]>([])));
    const usuarios$ = this.http.get<Usuario[]>(`${environment.apiUrl}/Usuario${this.suf}`)
      .pipe(timeout(5000), catchError(() => of<Usuario[]>([])));

    return forkJoin([bitacora$, usuarios$]).pipe(
      map(([registros, usuarios]) => {
        const nombrePorId = new Map(usuarios.map(u => [u.usuarioId, u.nombreUsuario]));
        return registros
          .map(r => ({
            ...r,
            nombreUsuario: nombrePorId.get(r.usuarioId) ?? `Usuario ${r.usuarioId}`
          }))
          .sort((a, b) => b.bitacoraId - a.bitacoraId);
      })
    );
  }
}
