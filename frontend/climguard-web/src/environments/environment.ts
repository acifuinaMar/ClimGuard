// Configuración para DESARROLLO (cuando corres npm start)
export const environment = {
  produccion: false,

  // ---- API REAL, desplegada en el VPS del equipo (HTTPS) ----
  // Así, al correr `npm start`, el frontend local consume el backend en vivo.
  apiUrl: 'https://climguard.acifuina.online/api',
  sufijoArchivo: '',

  // ---- SignalR: Hub de tiempo real (mismo VPS) ----
  hubUrl: 'https://climguard.acifuina.online/hubs/monitoreo'

  // ---- DATOS DE PRUEBA LOCALES ----
  // Para construir pantallas cuando la API no tenga datos cargados,
  // comenta las dos líneas de arriba y descomenta estas dos:
  //
  // apiUrl: '/datos-prueba',
  // sufijoArchivo: '.json'
};
