# =====================================================================
#  Dockerfile del frontend — construcción en DOS etapas
# =====================================================================
#  ¿Por qué dos etapas? Para que la imagen final sea pequeña.
#
#  Etapa 1 (build): usa Node, que pesa ~1 GB, solo para COMPILAR Angular.
#  Etapa 2 (final): usa nginx, que pesa ~40 MB, solo para SERVIR el
#                   resultado. Node se descarta; no viaja a la imagen final.
#
#  Resultado: una imagen ligera que solo contiene los archivos estáticos
#  y un servidor web, que es exactamente lo que pide el enunciado.
# =====================================================================

# ---------- ETAPA 1: compilar ----------
FROM node:22-alpine AS build

WORKDIR /app

# Copiamos primero solo los archivos de dependencias. Docker guarda en caché
# esta capa: si el código cambia pero las dependencias no, no vuelve a
# descargarlas. Acelera muchísimo las reconstrucciones.
COPY package*.json ./
RUN npm ci

# Ahora sí, el resto del código, y compilamos para producción.
COPY . .
RUN npm run build

# ---------- ETAPA 2: servir ----------
FROM nginx:alpine AS final

# La configuración de nginx que entiende las rutas de Angular.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos SOLO los archivos compilados desde la etapa anterior.
# Angular 20 deja el resultado en dist/<nombre>/browser
COPY --from=build /app/dist/climguard-web/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
