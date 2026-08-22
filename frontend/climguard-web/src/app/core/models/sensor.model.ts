// Esta interfaz es una COPIA EXACTA de lo que devuelve la API real.
// La saqué de las capturas de Swagger que se compartio Mahuerk.
//
// Si esto no coincide campo por campo con la API, los datos llegan
// pero la pantalla los muestra vacíos, y es dificilísimo de encontrar.

export interface Sensor {
  sensorId: number;
  comunidadId: number;
  tipoSensorId: number;
  nombre: string;
  valorActual: number;
  activo: boolean;
  fechaInstalacion: string;
  ultimaActualizacion: string;
  usuarioLogeado: number;
}