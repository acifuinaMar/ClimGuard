import { HttpErrorResponse } from '@angular/common/http';

/**
 * Convierte un error HTTP en un texto corto y útil que incluye el CÓDIGO del
 * servidor. Así, cuando algo falla, se ve "Error 400: ..." en vez de un mensaje
 * genérico — útil para diagnosticar (400 = datos inválidos, 401/403 = permiso,
 * 404 = no existe, 500 = error del servidor, 0 = no hubo respuesta/CORS).
 */
export function detalleError(err: unknown): string {
  const e = err as HttpErrorResponse;
  const status = e?.status ?? 0;

  // status 0 = el servidor no respondió (caído, sin red, o bloqueo CORS).
  if (!status) return 'Sin respuesta del servidor (red o CORS).';

  const cuerpo = e?.error as unknown;
  let detalle = '';
  if (typeof cuerpo === 'string') {
    detalle = cuerpo;
  } else if (cuerpo && typeof cuerpo === 'object') {
    const c = cuerpo as Record<string, unknown>;
    if (typeof c['title'] === 'string') detalle = c['title'] as string;
    else if (typeof c['message'] === 'string') detalle = c['message'] as string;
    else if (c['errors']) detalle = Object.values(c['errors'] as Record<string, string[]>).flat().join(' ');
  } else if (typeof e?.message === 'string') {
    detalle = e.message;
  }

  return `Error ${status}${detalle ? ': ' + detalle : ''}`;
}
