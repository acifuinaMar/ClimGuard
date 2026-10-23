/** Contratos del Report Service (/api/reports). */
export interface TipoReporte {
  key: string;
  name: string;
  description: string;
  /** Filtros que acepta este tipo de reporte. */
  filters: string[];
}

export type EstadoReporte = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/** Metadatos de un reporte generado (RF-REP-09). */
export interface Reporte {
  reportId: string;
  type: string;
  generatedBy: string;
  generatedByName?: string;
  generatedAt: string;
  completedAt?: string | null;
  filters: Record<string, string | number | boolean>;
  status: EstadoReporte;
  fileName: string;
  fileSize?: number;
  rowCount?: number;
  truncated?: boolean;
  downloadCount?: number;
  error?: string;
}

export interface PaginaReportes {
  items: Reporte[];
  total: number;
}

/** Indicadores ejecutivos del panel (GET /api/reports/dashboard). */
export interface IndicadoresEjecutivos {
  generatedAt: string;
  situacion: { nivel: string; tono: 'ok' | 'warn' | 'danger' };
  comunidades: { total: number; activas: number };
  sensores: { total: number; sinComunicacion: number; porEstado: { nombre: string; cantidad: number }[] };
  alertas: {
    total: number;
    activas: number;
    porNivel: { id: number; nombre: string; colorHex: string; cantidad: number }[];
    porFenomeno: { id: number; nombre: string; cantidad: number }[];
    porComunidad: { id: number; nombre: string; cantidad: number }[];
  };
  eventos: { total: number };
  clima: { variable: string; unidad: string; lecturas: number; promedio: string; minimo: string; maximo: string }[];
}
