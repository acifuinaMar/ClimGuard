// Configuración para cuando corra DENTRO DEL CONTENEDOR
export const environment = {
  produccion: true,

  // Dentro de Docker los contenedores se llaman por su nombre de servicio,
  // no por localhost. Esto lo ajustamos el jueves.
  apiUrl: 'http://api:8080/api',
  sufijoArchivo: ''
};