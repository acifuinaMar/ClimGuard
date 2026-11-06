// Copia EXACTA de ComunidadResultDto del backend (lo que devuelve GET /api/Comunidad).
// OJO: el backend usa "nombreComunidad" (no "nombre") y agrega país, departamento,
// municipio y estado (activo). Si un nombre no coincide, el dato llega pero sale vacío.
export interface Comunidad {
  comunidadId: number;
  nombreComunidad: string;
  descripcion: string | null;
  pais: string;
  departamento: string;
  municipio: string;
  latitud: number;
  longitud: number;
  activo: boolean;

  // Campos de auditoría que maneja el backend (quién/cuándo creó y modificó).
  // El frontend solo los conserva para reenviarlos al editar; no los muestra.
  usuarioIng?: number;
  fechaIng?: string;
  usuarioAct?: number | null;
  fechaAct?: string | null;
}
