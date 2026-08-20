// Configuración para DESARROLLO (cuando corres npm start)
export const environment = {
  produccion: false,

  // ---- API REAL, en el servidor compartido del equipo ----
  // OJO: si un compañero corre el backend en su propia máquina, puede cambiar
  // esto a http://localhost:5093/api — pero eso solo funciona en SU computadora.
  // Para que funcione en la de todos, dejamos el servidor público.
  apiUrl: 'http://157.245.253.228:8080/api',
  sufijoArchivo: ''

  // ---- DATOS DE PRUEBA LOCALES ----
  // Para construir pantallas cuando la API no tenga datos cargados,
  // comenta las dos líneas de arriba y descomenta estas dos:
  //
  // apiUrl: '/datos-prueba',
  // sufijoArchivo: '.json'
};
