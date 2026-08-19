// Configuración para DESARROLLO (cuando corres npm start)
export const environment = {
  produccion: false,

  // La dirección de la API. Es la ÚNICA línea que hay que cambiar
  // cuando nos pasen la dirección real.
  // Por ahora apunta a datos de prueba locales.
  apiUrl: 'http://localhost:5093/api',

  // Los datos de prueba son archivos .json en disco; la API real no lleva extensión.
  // Al cambiar a la API de verdad, esto pasa a ser cadena vacía.
  sufijoArchivo: ''
};