// Configuración para DESARROLLO (cuando corres npm start)
export const environment = {
  produccion: false,

  // ---- API REAL, en el servidor del equipo ----
  apiUrl: 'http://localhost:5093/api',
  sufijoArchivo: ''

  // ---- DATOS DE PRUEBA LOCALES ----
  // Para construir pantallas cuando la API no tenga datos cargados,
  // comenta las dos líneas de arriba y descomenta estas dos:
  //
  // apiUrl: '/datos-prueba',
  // sufijoArchivo: '.json'
};
