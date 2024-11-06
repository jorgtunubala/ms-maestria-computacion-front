# Imagen base de Node.js para construir la app
FROM node:16 AS build

# Configurar memoria máxima para Node.js
ENV NODE_OPTIONS="--max_old_space_size=4096"

# Crear directorio de trabajo y copiar archivos del proyecto
WORKDIR /app
COPY . .

# Instalar dependencias y construir la aplicación
RUN npm install
RUN npm run build --prod

# Imagen ligera de Nginx para servir el contenido
FROM nginx:alpine
COPY --from=build /app/dist/maestria-computacion-front /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
