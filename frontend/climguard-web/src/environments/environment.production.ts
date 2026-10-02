// Configuración para cuando corra DENTRO DEL CONTENEDOR (Docker)
export const environment = {
  produccion: true,

  // Ruta RELATIVA, a propósito.
  //
  // El navegador no puede usar "http://api:8080" — ese nombre solo existe
  // DENTRO de la red de Docker, no en la máquina del usuario.
  //
  // En su lugar, el navegador pide "/api/..." al mismo servidor que le sirvió
  // la página (nginx), y nginx lo reenvía al contenedor de la API.
  // Un solo origen: sin problemas de CORS.
  apiUrl: '/api',
  sufijoArchivo: ''
};
